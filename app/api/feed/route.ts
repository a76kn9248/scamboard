import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface FeedEvent {
  type: "report" | "confirm_milestone" | "roast_locked" | "bounty";
  message: string;
  timestamp: Date;
  link: string;
  icon: string;
}

const MILESTONE_THRESHOLDS = [5, 10, 25, 50, 100];

export async function GET() {
  try {
    const events: FeedEvent[] = [];

    // Get recent reports (last 50)
    const recentReports = await prisma.report.findMany({
      include: {
        author: { select: { nickname: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    for (const report of recentReports) {
      events.push({
        type: "report",
        message: `${report.author.nickname} reported ${report.type === "twitter" ? "@" : ""}${report.identifier.slice(0, 12)}${report.identifier.length > 12 ? "..." : ""}`,
        timestamp: report.createdAt,
        link: `/report/${report.id}`,
        icon: "\u{1F6A9}", // red flag
      });
    }

    // Get recent confirms that hit milestones
    const recentConfirms = await prisma.confirm.findMany({
      include: {
        user: { select: { nickname: true } },
        report: {
          select: {
            id: true,
            identifier: true,
            type: true,
            _count: { select: { confirms: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Track which reports we've added milestones for
    const reportMilestones = new Map<string, number[]>();

    for (const confirm of recentConfirms) {
      const reportId = confirm.report.id;
      const confirmCount = confirm.report._count.confirms;

      // Check if this confirm count matches a milestone
      for (const threshold of MILESTONE_THRESHOLDS) {
        if (confirmCount >= threshold) {
          const existing = reportMilestones.get(reportId) || [];
          if (!existing.includes(threshold)) {
            existing.push(threshold);
            reportMilestones.set(reportId, existing);

            // Only add milestone event if this confirm brought us to this threshold
            const identifier = confirm.report.identifier;
            const displayId = confirm.report.type === "twitter"
              ? `@${identifier.slice(0, 12)}${identifier.length > 12 ? "..." : ""}`
              : `${identifier.slice(0, 8)}...${identifier.slice(-4)}`;

            events.push({
              type: "confirm_milestone",
              message: `${confirm.user.nickname} confirmed ${displayId} (${confirmCount} confirms!)`,
              timestamp: confirm.createdAt,
              link: `/report/${reportId}`,
              icon: "\u{1F6A8}", // rotating light
            });
            break; // Only add one milestone event per confirm
          }
        }
      }
    }

    // Get recent roast locks
    const recentLockedReports = await prisma.report.findMany({
      where: {
        shameLocked: true,
        roastTitle: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    for (const report of recentLockedReports) {
      events.push({
        type: "roast_locked",
        message: `"${report.roastTitle}" won as roast title for ${report.type === "twitter" ? "@" : ""}${report.identifier.slice(0, 12)}${report.identifier.length > 12 ? "..." : ""}`,
        timestamp: report.updatedAt,
        link: `/report/${report.id}`,
        icon: "\u{1F3C6}", // trophy
      });
    }

    // Get recent bounties
    const recentBounties = await prisma.bounty.findMany({
      include: {
        user: { select: { nickname: true } },
        report: {
          select: {
            id: true,
            identifier: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    for (const bounty of recentBounties) {
      const identifier = bounty.report.identifier;
      const displayId = bounty.report.type === "twitter"
        ? `@${identifier.slice(0, 12)}${identifier.length > 12 ? "..." : ""}`
        : `${identifier.slice(0, 8)}...${identifier.slice(-4)}`;

      events.push({
        type: "bounty",
        message: `${bounty.user.nickname} wants more evidence on ${displayId}`,
        timestamp: bounty.createdAt,
        link: `/report/${bounty.report.id}`,
        icon: "\u{1F4B0}", // money bag
      });
    }

    // Sort all events by timestamp and limit to 50
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const limitedEvents = events.slice(0, 50);

    return NextResponse.json({ events: limitedEvents });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
