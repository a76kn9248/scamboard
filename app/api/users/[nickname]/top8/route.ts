import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;

    const user = await prisma.user.findUnique({
      where: { nickname },
      select: { topWatchdogIds: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.topWatchdogIds || user.topWatchdogIds.length === 0) {
      return NextResponse.json({ watchdogs: [] });
    }

    // Fetch all watchdog user profiles
    const watchdogs = await prisma.user.findMany({
      where: { id: { in: user.topWatchdogIds } },
      select: {
        id: true,
        nickname: true,
        profileColor: true,
        title: true,
        mood: true,
      },
    });

    // Preserve order from topWatchdogIds
    const orderedWatchdogs = user.topWatchdogIds
      .map((id) => watchdogs.find((w) => w.id === id))
      .filter(Boolean);

    return NextResponse.json({
      watchdogs: orderedWatchdogs,
    });
  } catch (error) {
    console.error("Error fetching top 8:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
