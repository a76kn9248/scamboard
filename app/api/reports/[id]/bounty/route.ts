import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/validation";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const bounties = await prisma.bounty.findMany({
      where: { reportId },
      include: {
        user: { select: { nickname: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const session = await getServerSession(authOptions);
    const userHasBounty = session?.user?.id
      ? bounties.some((b) => b.userId === session.user.id)
      : false;

    return NextResponse.json({
      count: bounties.length,
      bounties: bounties.map((b) => ({
        id: b.id,
        message: b.message,
        authorNickname: b.user.nickname,
        createdAt: b.createdAt,
      })),
      userHasBounty,
    });
  } catch (error) {
    console.error("Error fetching bounties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user already has a bounty on this report
    const existingBounty = await prisma.bounty.findUnique({
      where: {
        userId_reportId: {
          userId: session.user.id,
          reportId,
        },
      },
    });

    if (existingBounty) {
      return NextResponse.json(
        { error: "You already have a bounty on this report" },
        { status: 400 }
      );
    }

    const sanitizedMessage = message ? sanitizeInput(message).slice(0, 280) : null;

    const bounty = await prisma.bounty.create({
      data: {
        userId: session.user.id,
        reportId,
        message: sanitizedMessage,
      },
      include: {
        user: { select: { nickname: true } },
      },
    });

    // Award XP
    await awardXP(session.user.id, XP_REWARDS.ADD_BOUNTY);

    const newCount = await prisma.bounty.count({
      where: { reportId },
    });

    return NextResponse.json(
      {
        message: "Bounty added",
        bounty: {
          id: bounty.id,
          message: bounty.message,
          authorNickname: bounty.user.nickname,
          createdAt: bounty.createdAt,
        },
        count: newCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bounty:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
