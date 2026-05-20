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

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { authorId: user.id },
        include: {
          subscammer: {
            select: { slug: true },
          },
          _count: {
            select: { confirms: true, comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.report.count({
        where: { authorId: user.id },
      }),
    ]);

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        type: r.type,
        identifier: r.identifier,
        reason: r.reason,
        confirmCount: r._count.confirms,
        commentCount: r._count.comments,
        subscammer: r.subscammer?.slug,
        createdAt: r.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
