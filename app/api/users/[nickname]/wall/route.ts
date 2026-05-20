import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Get wall posts for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Find user by nickname
    const user = await prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wall posts
    const wallPosts = await prisma.wallPost.findMany({
      where: { userId: user.id },
      include: {
        author: {
          select: {
            nickname: true,
            profileColor: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.wallPost.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      wallPosts: wallPosts.map((post) => ({
        id: post.id,
        body: post.body,
        authorNickname: post.author.nickname,
        authorColor: post.author.profileColor,
        authorTitle: post.author.title,
        createdAt: post.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching wall posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Post on someone's wall
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, turnstileToken } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: "Wall posts must be 280 characters or less" },
        { status: 400 }
      );
    }

    // Verify Turnstile
    if (turnstileToken) {
      const turnstileValid = await verifyTurnstile(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "Bot verification failed" },
          { status: 400 }
        );
      }
    }

    // Rate limit check (15 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "wall_post", 15000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Please wait ${rateLimitResult.retryAfter} seconds before posting again` },
        { status: 429 }
      );
    }

    // Find user by nickname
    const targetUser = await prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create wall post
    const wallPost = await prisma.wallPost.create({
      data: {
        body: content.trim(),
        userId: targetUser.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            nickname: true,
            profileColor: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Wall post created",
      wallPost: {
        id: wallPost.id,
        body: wallPost.body,
        authorNickname: wallPost.author.nickname,
        authorColor: wallPost.author.profileColor,
        authorTitle: wallPost.author.title,
        createdAt: wallPost.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating wall post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
