import { NextResponse } from "next/server";
import { getTopScammers } from "@/lib/scammer-aggregation";
import { getThreatLevel } from "@/lib/threat-levels";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topScammers = await getTopScammers(10);

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
        // Include first report ID for linking
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
