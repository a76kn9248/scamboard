import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by nickname (case-insensitive, partial match)
    const users = await prisma.user.findMany({
      where: {
        nickname: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nickname: true,
        profileColor: true,
        title: true,
        mood: true,
        xp: true,
      },
      orderBy: {
        xp: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
