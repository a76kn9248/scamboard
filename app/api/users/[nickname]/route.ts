import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextTitleThreshold } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;

    const user = await prisma.user.findUnique({
      where: { nickname },
      select: {
        id: true,
        nickname: true,
        bio: true,
        profileColor: true,
        title: true,
        xp: true,
        mood: true,
        currentlyDoing: true,
        specialty: true,
        themeSongUrl: true,
        themeSongLabel: true,
        createdAt: true,
        _count: {
          select: {
            reports: true,
            confirms: true,
            comments: true,
            roasts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count roast wins
    const roastWins = await prisma.report.count({
      where: {
        shameLocked: true,
        roasts: {
          some: {
            authorId: user.id,
            text: { not: "" }, // Will be matched against roastTitle
          },
        },
      },
    });

    // Get recent activity
    const recentReports = await prisma.report.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        identifier: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentConfirms = await prisma.confirm.findMany({
      where: { userId: user.id },
      select: {
        createdAt: true,
        report: {
          select: {
            id: true,
            identifier: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentComments = await prisma.comment.findMany({
      where: { userId: user.id },
      select: {
        createdAt: true,
        text: true,
        report: {
          select: {
            id: true,
            identifier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const nextThreshold = getNextTitleThreshold(user.xp);

    return NextResponse.json({
      nickname: user.nickname,
      bio: user.bio,
      profileColor: user.profileColor,
      title: user.title,
      xp: user.xp,
      mood: user.mood,
      currentlyDoing: user.currentlyDoing,
      specialty: user.specialty,
      themeSongUrl: user.themeSongUrl,
      themeSongLabel: user.themeSongLabel,
      nextTitleProgress: nextThreshold,
      createdAt: user.createdAt,
      stats: {
        reports: user._count.reports,
        confirms: user._count.confirms,
        comments: user._count.comments,
        roasts: user._count.roasts,
        roastWins,
      },
      recentActivity: {
        reports: recentReports.map((r) => ({
          type: "report",
          reportId: r.id,
          identifier: r.identifier,
          reportType: r.type,
          createdAt: r.createdAt,
        })),
        confirms: recentConfirms.map((c) => ({
          type: "confirm",
          reportId: c.report.id,
          identifier: c.report.identifier,
          reportType: c.report.type,
          createdAt: c.createdAt,
        })),
        comments: recentComments.map((c) => ({
          type: "comment",
          reportId: c.report.id,
          identifier: c.report.identifier,
          preview: c.text.slice(0, 50),
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
