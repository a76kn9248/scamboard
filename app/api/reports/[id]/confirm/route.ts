import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
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
    const { isVictim } = body;

    // Check rate limit (1 per 5 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "confirm", 5000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user is the author (can't confirm own report)
    if (report.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot confirm your own report" },
        { status: 400 }
      );
    }

    // Check if already confirmed
    const existingConfirm = await prisma.confirm.findUnique({
      where: {
        userId_reportId: {
          userId: session.user.id,
          reportId,
        },
      },
    });

    if (existingConfirm) {
      // If trying to upgrade to victim status
      if (isVictim && !existingConfirm.isVictim) {
        await prisma.confirm.update({
          where: { id: existingConfirm.id },
          data: { isVictim: true },
        });

        const [confirmCount, victimCount] = await Promise.all([
          prisma.confirm.count({ where: { reportId } }),
          prisma.confirm.count({ where: { reportId, isVictim: true } }),
        ]);

        // Award extra XP for victim upgrade (difference)
        const xpResult = await awardXP(
          session.user.id,
          XP_REWARDS.VICTIM_CONFIRM - XP_REWARDS.CONFIRM_SCAMMER
        );

        return NextResponse.json({
          message: "Marked as victim",
          confirmed: true,
          isVictim: true,
          confirmCount,
          victimCount,
          xpAwarded: XP_REWARDS.VICTIM_CONFIRM - XP_REWARDS.CONFIRM_SCAMMER,
          newTitle: xpResult.newTitle,
        });
      }

      // Toggle off - remove confirm
      await prisma.confirm.delete({
        where: { id: existingConfirm.id },
      });

      const [confirmCount, victimCount] = await Promise.all([
        prisma.confirm.count({ where: { reportId } }),
        prisma.confirm.count({ where: { reportId, isVictim: true } }),
      ]);

      return NextResponse.json({
        message: "Confirm removed",
        confirmed: false,
        isVictim: false,
        confirmCount,
        victimCount,
      });
    } else {
      // Add confirm
      const victimFlag = isVictim === true;
      await prisma.confirm.create({
        data: {
          userId: session.user.id,
          reportId,
          isVictim: victimFlag,
        },
      });

      const [confirmCount, victimCount] = await Promise.all([
        prisma.confirm.count({ where: { reportId } }),
        prisma.confirm.count({ where: { reportId, isVictim: true } }),
      ]);

      // Award XP - more for victim confirms
      const xpAmount = victimFlag
        ? XP_REWARDS.VICTIM_CONFIRM
        : XP_REWARDS.CONFIRM_SCAMMER;
      const xpResult = await awardXP(session.user.id, xpAmount);

      return NextResponse.json({
        message: victimFlag ? "Confirmed as victim" : "Report confirmed",
        confirmed: true,
        isVictim: victimFlag,
        confirmCount,
        victimCount,
        xpAwarded: xpAmount,
        newTitle: xpResult.newTitle,
      });
    }
  } catch (error) {
    console.error("Error toggling confirm:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
