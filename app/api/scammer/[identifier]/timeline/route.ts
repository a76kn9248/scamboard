import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TimelineEvent = {
  type: string;
  message: string;
  createdAt: Date;
  actorNickname?: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decodedIdentifier = decodeURIComponent(identifier);

    // Get all reports for this identifier
    const reports = await prisma.report.findMany({
      where: {
        identifier: {
          equals: decodedIdentifier,
          mode: "insensitive",
        },
      },
      include: {
        author: {
          select: { nickname: true },
        },
        confirms: {
          include: {
            user: { select: { nickname: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        bounties: {
          include: {
            user: { select: { nickname: true } },
          },
        },
        evidenceItems: {
          include: {
            addedBy: { select: { nickname: true } },
          },
        },
        linkedWallets: {
          include: {
            addedBy: { select: { nickname: true } },
          },
        },
        roasts: {
          where: { report: { shameLocked: true } },
          include: {
            author: { select: { nickname: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (reports.length === 0) {
      return NextResponse.json({ error: "Scammer not found" }, { status: 404 });
    }

    const events: TimelineEvent[] = [];

    // Add report events
    for (const report of reports) {
      events.push({
        type: "report",
        message: `Reported by ${report.author.nickname}`,
        createdAt: report.createdAt,
        actorNickname: report.author.nickname,
      });

      // Add evidence events
      for (const evidence of report.evidenceItems) {
        events.push({
          type: "evidence",
          message: `Evidence added: ${evidence.summary}`,
          createdAt: evidence.createdAt,
          actorNickname: evidence.addedBy.nickname,
        });
      }

      // Add linked wallet events
      for (const wallet of report.linkedWallets) {
        events.push({
          type: "linked_wallet",
          message: `Linked wallet identified: ${wallet.identifier.slice(0, 10)}...`,
          createdAt: wallet.createdAt,
          actorNickname: wallet.addedBy.nickname,
        });
      }

      // Add bounty events
      for (const bounty of report.bounties) {
        events.push({
          type: "bounty",
          message: `Bounty added by ${bounty.user.nickname}`,
          createdAt: bounty.createdAt,
          actorNickname: bounty.user.nickname,
        });
      }

      // Add roast win events (when shameLocked)
      if (report.shameLocked && report.roastTitle) {
        events.push({
          type: "roast_win",
          message: `Roast title locked: "${report.roastTitle}"`,
          createdAt: report.updatedAt,
        });
      }
    }

    // Calculate confirm milestones
    const allConfirms = reports.flatMap((r) => r.confirms);
    allConfirms.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const milestones = [5, 10, 25, 50, 100, 250];
    let currentCount = 0;
    let milestoneIndex = 0;

    for (const confirm of allConfirms) {
      currentCount++;
      while (
        milestoneIndex < milestones.length &&
        currentCount >= milestones[milestoneIndex]
      ) {
        events.push({
          type: "milestone",
          message: `Reached ${milestones[milestoneIndex]} confirms`,
          createdAt: confirm.createdAt,
        });
        milestoneIndex++;
      }
    }

    // Add threat level promotions based on confirm thresholds
    const threatThresholds = [
      { count: 5, level: "MEDIUM" },
      { count: 15, level: "HIGH" },
      { count: 25, level: "EXTREME" },
      { count: 50, level: "LEGENDARY" },
    ];

    currentCount = 0;
    let threatIndex = 0;

    for (const confirm of allConfirms) {
      currentCount++;
      while (
        threatIndex < threatThresholds.length &&
        currentCount >= threatThresholds[threatIndex].count
      ) {
        events.push({
          type: "threat_level",
          message: `Promoted to ${threatThresholds[threatIndex].level} threat`,
          createdAt: confirm.createdAt,
        });
        threatIndex++;
      }
    }

    // Sort all events by date and take last 20
    events.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      events: events.slice(0, 20),
    });
  } catch (error) {
    console.error("Error fetching scammer timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
