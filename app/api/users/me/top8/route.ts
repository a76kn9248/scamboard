import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { watchdogIds } = body;

    // Validate input
    if (!Array.isArray(watchdogIds)) {
      return NextResponse.json(
        { error: "watchdogIds must be an array" },
        { status: 400 }
      );
    }

    if (watchdogIds.length > 8) {
      return NextResponse.json(
        { error: "Maximum 8 watchdogs allowed" },
        { status: 400 }
      );
    }

    // Remove duplicates
    const uniqueIds = [...new Set(watchdogIds)];

    // Can't add yourself
    if (uniqueIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot add yourself to your Top 8" },
        { status: 400 }
      );
    }

    // Verify all user IDs exist
    if (uniqueIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      if (existingUsers.length !== uniqueIds.length) {
        return NextResponse.json(
          { error: "One or more user IDs not found" },
          { status: 400 }
        );
      }
    }

    // Update user's top 8
    await prisma.user.update({
      where: { id: session.user.id },
      data: { topWatchdogIds: uniqueIds },
    });

    // Fetch the updated watchdogs
    const watchdogs = await prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        nickname: true,
        profileColor: true,
        title: true,
        mood: true,
      },
    });

    // Preserve order
    const orderedWatchdogs = uniqueIds
      .map((id) => watchdogs.find((w) => w.id === id))
      .filter(Boolean);

    return NextResponse.json({
      message: "Top 8 updated",
      watchdogs: orderedWatchdogs,
    });
  } catch (error) {
    console.error("Error updating top 8:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
