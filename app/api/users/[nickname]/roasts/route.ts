import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const user = await prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [roasts, total] = await Promise.all([
      prisma.roast.findMany({
        where: { authorId: user.id },
        include: {
          report: {
            select: {
              id: true,
              identifier: true,
              type: true,
              roastTitle: true,
              shameLocked: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.roast.count({
        where: { authorId: user.id },
      }),
    ]);

    // Count wins (roasts that became the roastTitle)
    const wins = roasts.filter(
      (r) => r.report.shameLocked && r.report.roastTitle === r.text
    ).length;

    // Format roasts with vote counts
    const roastsWithScores = roasts.map((roast) => ({
      id: roast.id,
      text: roast.text,
      score: roast._count.votes,
      isWinner: roast.report.shameLocked && roast.report.roastTitle === roast.text,
      createdAt: roast.createdAt,
      report: {
        id: roast.report.id,
        identifier: roast.report.identifier,
        type: roast.report.type,
      },
    }));

    return NextResponse.json({
      roasts: roastsWithScores,
      total,
      wins,
    });
  } catch (error) {
    console.error("Error fetching user roasts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
