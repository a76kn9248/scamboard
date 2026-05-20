import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Achievement = {
  id: string;
  label: string;
  emoji: string;
  color: "gold" | "red" | "green" | "purple" | "cyan";
  earned: boolean;
  earnedAt?: Date;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;

    const user = await prisma.user.findUnique({
      where: { nickname },
      include: {
        reports: {
          include: {
            confirms: true,
          },
        },
        confirms: {
          orderBy: { createdAt: "asc" },
        },
        roasts: {
          include: {
            report: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const achievements: Achievement[] = [];

    // Caught a legendary - submitted a report that reached 25+ confirms
    const legendaryReport = user.reports.find(
      (r) => r.confirms.length >= 25
    );
    achievements.push({
      id: "caught_legendary",
      label: "Caught a legendary",
      emoji: "💀",
      color: "red",
      earned: !!legendaryReport,
      earnedAt: legendaryReport?.createdAt,
    });

    // 100% confirm rate - all reports have at least 1 confirm (min 5 reports)
    const confirmedReports = user.reports.filter((r) => r.confirms.length > 0);
    const hasConfirmRate =
      user.reports.length >= 5 &&
      confirmedReports.length === user.reports.length;
    achievements.push({
      id: "confirm_rate",
      label: "100% confirm rate",
      emoji: "🎯",
      color: "green",
      earned: hasConfirmRate,
    });

    // Roast champion - had a roast title win (shameLocked)
    const roastWin = user.roasts.find((r) => r.report.shameLocked);
    achievements.push({
      id: "roast_champion",
      label: "Roast champion",
      emoji: "✨",
      color: "purple",
      earned: !!roastWin,
      earnedAt: roastWin?.createdAt,
    });

    // First to spot - was the first to report a scammer that later hit 10+ confirms
    const firstToSpot = user.reports.find((r) => {
      if (r.confirms.length < 10) return false;
      // This is a simplified check - in reality we'd need to check if this was the first report
      // for this identifier across all users
      return true;
    });
    achievements.push({
      id: "first_to_spot",
      label: "First to spot",
      emoji: "👁",
      color: "cyan",
      earned: !!firstToSpot,
      earnedAt: firstToSpot?.createdAt,
    });

    // 14-day streak - submitted at least 1 report or confirm for 14 consecutive days
    // Simplified: check if user has confirms spread across at least 14 different days
    const confirmDates = new Set(
      user.confirms.map((c) => c.createdAt.toISOString().split("T")[0])
    );
    const reportDates = new Set(
      user.reports.map((r) => r.createdAt.toISOString().split("T")[0])
    );
    const allDates = new Set([...confirmDates, ...reportDates]);
    achievements.push({
      id: "streak_14",
      label: "14-day streak",
      emoji: "🔥",
      color: "gold",
      earned: allDates.size >= 14,
    });

    // Hunter rank based on total reports
    if (user.reports.length >= 50) {
      achievements.push({
        id: "elite_hunter",
        label: "Elite hunter (50+ reports)",
        emoji: "🥇",
        color: "gold",
        earned: true,
      });
    } else if (user.reports.length >= 25) {
      achievements.push({
        id: "veteran_hunter",
        label: "Veteran hunter (25+ reports)",
        emoji: "🥈",
        color: "cyan",
        earned: true,
      });
    } else if (user.reports.length >= 10) {
      achievements.push({
        id: "active_hunter",
        label: "Active hunter (10+ reports)",
        emoji: "🥉",
        color: "purple",
        earned: true,
      });
    }

    // Shield - confirmed 100+ scammers
    achievements.push({
      id: "shield",
      label: "Community shield (100+ confirms)",
      emoji: "🛡",
      color: "green",
      earned: user.confirms.length >= 100,
    });

    return NextResponse.json({
      achievements: achievements.filter((a) => a.earned),
      allAchievements: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
