import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTotalConfirmsForIdentifier } from "@/lib/scammer-aggregation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

async function checkAndLockRoast(reportId: string, identifier: string) {
  const totalConfirms = await getTotalConfirmsForIdentifier(identifier);

  if (totalConfirms >= 10) {
    // Get the top voted roast for this report
    const topRoast = await prisma.roast.findFirst({
      where: { reportId },
      include: {
        _count: { select: { votes: true } },
        author: true,
      },
      orderBy: { votes: { _count: "desc" } },
    });

    if (topRoast && topRoast._count.votes > 0) {
      // Check if not already locked
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { shameLocked: true },
      });

      if (!report?.shameLocked) {
        // Lock in the winning roast
        await prisma.report.update({
          where: { id: reportId },
          data: {
            shameLocked: true,
            roastTitle: topRoast.text,
          },
        });

        // Award bonus XP to the roast author
        await awardXP(topRoast.authorId, XP_REWARDS.ROAST_WINS);

        return { locked: true, winningRoast: topRoast.text };
      }
    }
  }

  return { locked: false };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roastId: string }> }
) {
  try {
    const { id: reportId, roastId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if roast exists and belongs to this report
    const roast = await prisma.roast.findFirst({
      where: {
        id: roastId,
        reportId,
      },
      include: {
        report: {
          select: { identifier: true, shameLocked: true },
        },
      },
    });

    if (!roast) {
      return NextResponse.json({ error: "Roast not found" }, { status: 404 });
    }

    if (roast.report.shameLocked) {
      return NextResponse.json(
        { error: "Roast title is already locked for this scammer" },
        { status: 400 }
      );
    }

    // Check if user already voted for this roast
    const existingVote = await prisma.roastVote.findUnique({
      where: {
        userId_roastId: {
          userId: session.user.id,
          roastId,
        },
      },
    });

    if (existingVote) {
      // Toggle off - remove vote
      await prisma.roastVote.delete({
        where: { id: existingVote.id },
      });

      const newCount = await prisma.roastVote.count({
        where: { roastId },
      });

      return NextResponse.json({
        message: "Vote removed",
        voted: false,
        voteCount: newCount,
      });
    } else {
      // Add vote
      await prisma.roastVote.create({
        data: {
          userId: session.user.id,
          roastId,
        },
      });

      const newCount = await prisma.roastVote.count({
        where: { roastId },
      });

      // Check if we should lock the roast title
      const lockResult = await checkAndLockRoast(reportId, roast.report.identifier);

      return NextResponse.json({
        message: lockResult.locked ? "Vote added - Roast title locked!" : "Vote added",
        voted: true,
        voteCount: newCount,
        shameLocked: lockResult.locked,
        winningRoast: lockResult.winningRoast,
      });
    }
  } catch (error) {
    console.error("Error voting on roast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
