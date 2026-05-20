import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

// Helper to get nesting depth of a comment
async function getCommentDepth(commentId: string): Promise<number> {
  let depth = 0;
  let currentId: string | null = commentId;

  while (currentId) {
    const result: { parentId: string | null } | null = await prisma.comment.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    if (result?.parentId) {
      depth++;
      currentId = result.parentId;
    } else {
      break;
    }
  }

  return depth;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get ALL comments for this report (flat list, client will build tree)
    const comments = await prisma.comment.findMany({
      where: { reportId },
      include: {
        user: {
          select: { id: true, nickname: true, profileColor: true },
        },
        votes: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform to flat array with parentId preserved
    const flatComments = comments.map((comment) => {
      const score = comment.votes.reduce((acc, v) => acc + v.value, 0);
      const userVote = userId
        ? comment.votes.find((v) => v.userId === userId)?.value ?? 0
        : 0;

      return {
        id: comment.id,
        text: comment.text,
        authorId: comment.user.id,
        authorNickname: comment.user.nickname,
        authorColor: comment.user.profileColor,
        parentId: comment.parentId, // This is the key - preserve parentId for ALL comments
        score,
        userVote,
        createdAt: comment.createdAt,
      };
    });

    return NextResponse.json({
      comments: flatComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, parentId } = body;

    // Check rate limit (1 per 15 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "comment", 15000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Validate input
    const sanitizedText = sanitizeInput(text || "");

    if (!sanitizedText || sanitizedText.length < 1) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    if (sanitizedText.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // If parentId provided, validate it
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      if (parentComment.reportId !== reportId) {
        return NextResponse.json(
          { error: "Parent comment belongs to different report" },
          { status: 400 }
        );
      }

      // Check nesting depth (max 3 levels)
      const depth = await getCommentDepth(parentId);
      if (depth >= 3) {
        return NextResponse.json(
          { error: "Maximum reply depth reached" },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text: sanitizedText,
        userId: session.user.id,
        reportId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, nickname: true, profileColor: true },
        },
      },
    });

    // Award XP for commenting
    const xpResult = await awardXP(session.user.id, XP_REWARDS.LEAVE_COMMENT);

    return NextResponse.json(
      {
        message: "Comment added",
        comment: {
          id: comment.id,
          text: comment.text,
          authorId: comment.user.id,
          authorNickname: comment.user.nickname,
          authorColor: comment.user.profileColor,
          parentId: comment.parentId,
          score: 0,
          userVote: 0,
          createdAt: comment.createdAt,
          replies: [],
        },
        xpAwarded: XP_REWARDS.LEAVE_COMMENT,
        newTitle: xpResult.newTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
