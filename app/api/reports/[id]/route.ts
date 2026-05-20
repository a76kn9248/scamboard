import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        author: {
          select: { nickname: true },
        },
        comments: {
          include: {
            user: {
              select: { nickname: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { confirms: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if current user has confirmed
    let userHasConfirmed = false;
    if (session?.user?.id) {
      const confirm = await prisma.confirm.findUnique({
        where: {
          userId_reportId: {
            userId: session.user.id,
            reportId: id,
          },
        },
      });
      userHasConfirmed = !!confirm;
    }

    return NextResponse.json({
      report: {
        id: report.id,
        type: report.type,
        identifier: report.identifier,
        reason: report.reason,
        evidence: report.evidence,
        authorNickname: report.author.nickname,
        confirmCount: report._count.confirms,
        userHasConfirmed,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        comments: report.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          authorNickname: comment.user.nickname,
          createdAt: comment.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
