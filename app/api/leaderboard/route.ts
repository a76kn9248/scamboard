import { NextRequest, NextResponse } from "next/server";
import { getTopScammers } from "@/lib/scammer-aggregation";
import { getThreatLevel } from "@/lib/threat-levels";
import { prisma } from "@/lib/prisma";
import { getTitleForXP } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "scammers";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);

    // If requesting watchdogs/users leaderboard
    if (type === "watchdogs" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          xp: { gt: 0 },
        },
        orderBy: {
          xp: "desc",
        },
        take: limit,
        select: {
          id: true,
          nickname: true,
          profileColor: true,
          title: true,
          xp: true,
          mood: true,
          _count: {
            select: {
              reports: true,
              confirms: true,
              roasts: true,
            },
          },
        },
      });

      const topUsers = users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        nickname: user.nickname,
        color: user.profileColor || "#ff3b9a",
        profileColor: user.profileColor || "#ff3b9a",
        title: user.title || getTitleForXP(user.xp),
        xp: user.xp,
        mood: user.mood,
        stats: {
          reports: user._count.reports,
          confirms: user._count.confirms,
          roastWins: user._count.roasts,
        },
      }));

      return NextResponse.json({ topUsers, watchdogs: topUsers });
    }

    // Default: scammer leaderboard
    const topScammers = await getTopScammers(limit);

    const leaderboard = topScammers.map((scammer, index) => {
      const threatInfo = getThreatLevel(scammer.totalConfirms);

      return {
        rank: index + 1,
        identifier: scammer.identifier,
        type: scammer.type,
        totalConfirms: scammer.totalConfirms,
        victimCount: scammer.victimCount,
        weightedScore: scammer.weightedScore,
        reportCount: scammer.reportCount,
        roastTitle: scammer.roastTitle,
        shameLocked: scammer.shameLocked,
        threatLevel: threatInfo.level,
        threatColor: threatInfo.color,
        fireEmojis: threatInfo.fireEmojis,
        animated: threatInfo.animated,
        firstReportDate: scammer.firstReportDate,
        latestReportDate: scammer.latestReportDate,
        primaryReportId: scammer.reports[0]?.id,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
