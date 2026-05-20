import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

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

    // Get all linked wallets for reports with this identifier
    const linkedWallets = await prisma.linkedWallet.findMany({
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
      linkedWallets: linkedWallets.map((lw) => ({
        id: lw.id,
        identifier: lw.identifier,
        type: lw.type,
        relationship: lw.relationship,
        confirms: lw.confirms,
        addedByNickname: lw.addedBy.nickname,
        createdAt: lw.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching linked wallets:", error);
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
    const { identifier, type, relationship, turnstileToken } = body;

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
    const rateLimitResult = checkRateLimit(
      session.user.id,
      "linked-wallet",
      30000
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    // Validate input
    const sanitizedIdentifier = sanitizeInput(identifier || "");
    const sanitizedRelationship = sanitizeInput(relationship || "");

    if (!sanitizedIdentifier || sanitizedIdentifier.length < 3) {
      return NextResponse.json(
        { error: "Identifier must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!type || !["deployer", "twitter"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'deployer' or 'twitter'" },
        { status: 400 }
      );
    }

    if (!sanitizedRelationship || sanitizedRelationship.length > 100) {
      return NextResponse.json(
        { error: "Relationship description must be 1-100 characters" },
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

    // Create linked wallet
    const linkedWallet = await prisma.linkedWallet.create({
      data: {
        identifier: sanitizedIdentifier,
        type,
        relationship: sanitizedRelationship,
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
    const xpResult = await awardXP(session.user.id, XP_REWARDS.ADD_LINKED_WALLET);

    return NextResponse.json(
      {
        message: "Linked wallet added",
        linkedWallet: {
          id: linkedWallet.id,
          identifier: linkedWallet.identifier,
          type: linkedWallet.type,
          relationship: linkedWallet.relationship,
          confirms: linkedWallet.confirms,
          addedByNickname: linkedWallet.addedBy.nickname,
          createdAt: linkedWallet.createdAt,
        },
        xpAwarded: XP_REWARDS.ADD_LINKED_WALLET,
        newTitle: xpResult.newTitle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating linked wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
