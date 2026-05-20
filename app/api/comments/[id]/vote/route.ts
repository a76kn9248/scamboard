import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { value } = body;

    // Check rate limit (1 per 2 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "vote", 2000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // Validate value
    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json(
        { error: "Value must be 1, -1, or 0" },
        { status: 400 }
      );
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Can't vote on own comment
    if (comment.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own comment" },
        { status: 400 }
      );
    }

    // Check for existing vote
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (value === 0) {
      // Remove vote if exists
      if (existingVote) {
        await prisma.commentVote.delete({
          where: { id: existingVote.id },
        });
      }
    } else if (existingVote) {
      // Update existing vote
      if (existingVote.value === value) {
        // Same value - toggle off (remove)
        await prisma.commentVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Different value - update
        await prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { value },
        });
      }
    } else {
      // Create new vote
      await prisma.commentVote.create({
        data: {
          userId: session.user.id,
          commentId,
          value,
        },
      });
    }

    // Get updated score
    const votes = await prisma.commentVote.findMany({
      where: { commentId },
    });
    const score = votes.reduce((acc, v) => acc + v.value, 0);
    const userVote =
      votes.find((v) => v.userId === session.user.id)?.value ?? 0;

    return NextResponse.json({
      message: "Vote recorded",
      score,
      userVote,
    });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
