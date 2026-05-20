import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput, validateIdentifier } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "confirms";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { identifier: { contains: search, mode: "insensitive" as const } },
            { reason: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Determine order by based on sort option
    type OrderByType = { confirms?: { _count: "desc" | "asc" }; createdAt?: "desc" | "asc"; roasts?: { _count: "desc" | "asc" }; bounties?: { _count: "desc" | "asc" }; disputeCount?: "desc" | "asc" };
    let orderBy: OrderByType = { createdAt: "desc" }; // default: new

    switch (sort) {
      case "confirms":
      case "hot": // hot = most confirms
        orderBy = { confirms: { _count: "desc" } };
        break;
      case "new":
        orderBy = { createdAt: "desc" };
        break;
      case "controversial":
        // controversial = has both confirms and disputes
        orderBy = { disputeCount: "desc" };
        break;
      case "roasted":
        orderBy = { roasts: { _count: "desc" } };
        break;
      case "bountied":
        orderBy = { bounties: { _count: "desc" } };
        break;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          author: {
            select: { nickname: true, profileColor: true, title: true },
          },
          subscammer: {
            select: { slug: true },
          },
          _count: {
            select: { confirms: true, comments: true, bounties: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    const formattedReports = reports.map((report, index) => ({
      id: report.id,
      type: report.type,
      identifier: report.identifier,
      reason: report.reason,
      evidence: report.evidence,
      chain: report.chain,
      roastTitle: report.roastTitle,
      authorNickname: report.author.nickname,
      authorColor: report.author.profileColor,
      authorTitle: report.author.title,
      subscammer: report.subscammer?.slug,
      confirmCount: report._count.confirms,
      commentCount: report._count.comments,
      bountyCount: report._count.bounties,
      createdAt: report.createdAt,
      rank: skip + index + 1,
    }));

    return NextResponse.json({
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, identifier, reason, evidence, turnstileToken } = body;

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

    // Check rate limit (1 per 30 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "report", 30000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Validate inputs
    const sanitizedIdentifier = sanitizeInput(identifier || "");
    const sanitizedReason = sanitizeInput(reason || "");
    const sanitizedEvidence = evidence ? sanitizeInput(evidence) : null;

    if (!type || !["deployer", "twitter"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    const identifierValidation = validateIdentifier(type, sanitizedIdentifier);
    if (!identifierValidation.valid) {
      return NextResponse.json(
        { error: identifierValidation.error },
        { status: 400 }
      );
    }

    if (!sanitizedReason || sanitizedReason.length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (sanitizedReason.length > 2000) {
      return NextResponse.json(
        { error: "Reason must be less than 2000 characters" },
        { status: 400 }
      );
    }

    // Clean Twitter handle
    const finalIdentifier =
      type === "twitter" && sanitizedIdentifier.startsWith("@")
        ? sanitizedIdentifier.slice(1)
        : sanitizedIdentifier;

    const report = await prisma.report.create({
      data: {
        type,
        identifier: finalIdentifier,
        reason: sanitizedReason,
        evidence: sanitizedEvidence,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { nickname: true },
        },
      },
    });

    // Award XP for submitting a report
    const xpResult = await awardXP(session.user.id, XP_REWARDS.SUBMIT_REPORT);

    return NextResponse.json(
      {
        message: "Report created successfully",
        report: {
          id: report.id,
          type: report.type,
          identifier: report.identifier,
          reason: report.reason,
          evidence: report.evidence,
          authorNickname: report.author.nickname,
          createdAt: report.createdAt,
        },
        xpAwarded: XP_REWARDS.SUBMIT_REPORT,
        newTitle: xpResult.newTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
