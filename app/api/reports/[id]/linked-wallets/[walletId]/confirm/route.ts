import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; walletId: string }> }
) {
  try {
    const { walletId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit (1 per 2 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "confirm-wallet", 2000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // Check if linked wallet exists
    const linkedWallet = await prisma.linkedWallet.findUnique({
      where: { id: walletId },
    });

    if (!linkedWallet) {
      return NextResponse.json(
        { error: "Linked wallet not found" },
        { status: 404 }
      );
    }

    // Can't confirm your own linked wallet submission
    if (linkedWallet.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot confirm your own submission" },
        { status: 400 }
      );
    }

    // Increment confirms
    const updated = await prisma.linkedWallet.update({
      where: { id: walletId },
      data: {
        confirms: { increment: 1 },
      },
    });

    // Award XP
    const xpResult = await awardXP(
      session.user.id,
      XP_REWARDS.CONFIRM_LINKED_WALLET
    );

    return NextResponse.json({
      message: "Linked wallet confirmed",
      confirms: updated.confirms,
      xpAwarded: XP_REWARDS.CONFIRM_LINKED_WALLET,
      newTitle: xpResult.newTitle,
    });
  } catch (error) {
    console.error("Error confirming linked wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
