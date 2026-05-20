import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

const VALID_EVIDENCE_TYPES = ["tx", "screenshot", "contract", "graph", "link"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    // Get the report to find the identifier
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { identifier: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Get all evidence for reports with this identifier
    const evidence = await prisma.evidence.findMany({
      where: {
        report: {
          identifier: {
            equals: report.identifier,
            mode: "insensitive",
          },
        },
      },
      include: {
        addedBy: {
          select: { nickname: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      evidence: evidence.map((e) => ({
        id: e.id,
        type: e.type,
        url: e.url,
        source: e.source,
        summary: e.summary,
        addedByNickname: e.addedBy.nickname,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching evidence:", error);
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
    const { type, url, source, summary, turnstileToken } = body;

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
    const rateLimitResult = checkRateLimit(session.user.id, "evidence", 15000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Validate input
    if (!type || !VALID_EVIDENCE_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: `Type must be one of: ${VALID_EVIDENCE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate URL
    const sanitizedUrl = sanitizeInput(url || "");
    try {
      new URL(sanitizedUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const sanitizedSource = sanitizeInput(source || "");
    if (!sanitizedSource || sanitizedSource.length > 50) {
      return NextResponse.json(
        { error: "Source must be 1-50 characters" },
        { status: 400 }
      );
    }

    const sanitizedSummary = sanitizeInput(summary || "");
    if (!sanitizedSummary || sanitizedSummary.length > 120) {
      return NextResponse.json(
        { error: "Summary must be 1-120 characters" },
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

    // Create evidence
    const evidence = await prisma.evidence.create({
      data: {
        type,
        url: sanitizedUrl,
        source: sanitizedSource,
        summary: sanitizedSummary,
        reportId,
        userId: session.user.id,
      },
      include: {
        addedBy: {
          select: { nickname: true },
        },
      },
    });

    // Award XP
    const xpResult = await awardXP(session.user.id, XP_REWARDS.ADD_EVIDENCE);

    return NextResponse.json(
      {
        message: "Evidence added",
        evidence: {
          id: evidence.id,
          type: evidence.type,
          url: evidence.url,
          source: evidence.source,
          summary: evidence.summary,
          addedByNickname: evidence.addedBy.nickname,
          createdAt: evidence.createdAt,
        },
        xpAwarded: XP_REWARDS.ADD_EVIDENCE,
        newTitle: xpResult.newTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating evidence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
