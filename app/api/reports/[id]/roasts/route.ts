import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";
import { getTotalConfirmsForIdentifier } from "@/lib/scammer-aggregation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { identifier: true, shameLocked: true, roastTitle: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const roasts = await prisma.roast.findMany({
      where: { reportId },
      include: {
        author: { select: { nickname: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { votes: { _count: "desc" } },
    });

    // Get total confirms for this identifier
    const totalConfirms = await getTotalConfirmsForIdentifier(report.identifier);

    const session = await getServerSession(authOptions);
    let userVotes: string[] = [];

    if (session?.user?.id) {
      const votes = await prisma.roastVote.findMany({
        where: {
          userId: session.user.id,
          roast: { reportId },
        },
        select: { roastId: true },
      });
      userVotes = votes.map((v) => v.roastId);
    }

    return NextResponse.json({
      roasts: roasts.map((r) => ({
        id: r.id,
        text: r.text,
        authorNickname: r.author.nickname,
        voteCount: r._count.votes,
        createdAt: r.createdAt,
        userHasVoted: userVotes.includes(r.id),
      })),
      shameLocked: report.shameLocked,
      lockedRoastTitle: report.roastTitle,
      totalConfirms,
      roastsUnlocked: totalConfirms >= 5,
    });
  } catch (error) {
    console.error("Error fetching roasts:", error);
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

    // Check rate limit (1 per 60 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "roast", 60000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { identifier: true, shameLocked: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.shameLocked) {
      return NextResponse.json(
        { error: "Roast title is already locked for this scammer" },
        { status: 400 }
      );
    }

    // Check if scammer has 5+ confirms
    const totalConfirms = await getTotalConfirmsForIdentifier(report.identifier);
    if (totalConfirms < 5) {
      return NextResponse.json(
        { error: "Scammer needs at least 5 confirms before roasts are unlocked" },
        { status: 400 }
      );
    }

    // Validate text
    const sanitizedText = sanitizeInput(text || "").slice(0, 60);
    if (!sanitizedText || sanitizedText.length < 3) {
      return NextResponse.json(
        { error: "Roast title must be at least 3 characters" },
        { status: 400 }
      );
    }

    const roast = await prisma.roast.create({
      data: {
        text: sanitizedText,
        authorId: session.user.id,
        reportId,
      },
      include: {
        author: { select: { nickname: true } },
      },
    });

    // Award XP
    await awardXP(session.user.id, XP_REWARDS.SUBMIT_ROAST);

    return NextResponse.json(
      {
        message: "Roast submitted",
        roast: {
          id: roast.id,
          text: roast.text,
          authorNickname: roast.author.nickname,
          voteCount: 0,
          createdAt: roast.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating roast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
