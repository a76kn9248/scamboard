import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

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
    const { text, turnstileToken } = body;

    // Verify Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Bot verification required" },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Bot verification failed" },
        { status: 400 }
      );
    }

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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text: sanitizedText,
        userId: session.user.id,
        reportId,
      },
      include: {
        user: {
          select: { nickname: true },
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
          authorNickname: comment.user.nickname,
          createdAt: comment.createdAt,
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
