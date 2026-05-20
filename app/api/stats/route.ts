import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalReports, totalConfirms, totalComments, totalUsers] = await Promise.all([
      prisma.report.count(),
      prisma.confirm.count(),
      prisma.comment.count(),
      prisma.user.count(),
    ]);

    // Count unique scammers (unique identifiers, case-insensitive)
    const uniqueScammers = await prisma.report.groupBy({
      by: ["identifier"],
    });

    return NextResponse.json({
      totalScammers: uniqueScammers.length,
      totalReports,
      totalConfirms,
      totalComments,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
