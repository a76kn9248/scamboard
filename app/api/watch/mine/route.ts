import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const watches = await prisma.watch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Group by target type
    const scammers = watches
      .filter((w) => w.targetType === "scammer")
      .map((w) => w.targetId);
    const users = watches
      .filter((w) => w.targetType === "user")
      .map((w) => w.targetId);

    // Fetch user details for watched users
    const watchedUsers = await prisma.user.findMany({
      where: { id: { in: users } },
      select: {
        id: true,
        nickname: true,
        profileColor: true,
        title: true,
      },
    });

    return NextResponse.json({
      scammers,
      users: watchedUsers,
    });
  } catch (error) {
    console.error("Error fetching watches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
