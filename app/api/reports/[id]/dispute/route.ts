import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user is the author (can't dispute own report)
    if (report.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot dispute your own report" },
        { status: 400 }
      );
    }

    // Check if already disputed
    const existingDispute = await prisma.dispute.findUnique({
      where: {
        userId_reportId: {
          userId: session.user.id,
          reportId,
        },
      },
    });

    if (existingDispute) {
      // Toggle off - remove dispute
      await prisma.dispute.delete({
        where: { id: existingDispute.id },
      });

      // Decrement dispute count on report
      await prisma.report.update({
        where: { id: reportId },
        data: { disputeCount: { decrement: 1 } },
      });

      const newCount = await prisma.dispute.count({
        where: { reportId },
      });

      return NextResponse.json({
        message: "Dispute removed",
        disputed: false,
        disputeCount: newCount,
      });
    } else {
      // Remove any existing confirm first (can't both confirm and dispute)
      const existingConfirm = await prisma.confirm.findUnique({
        where: {
          userId_reportId: {
            userId: session.user.id,
            reportId,
          },
        },
      });

      if (existingConfirm) {
        await prisma.confirm.delete({
          where: { id: existingConfirm.id },
        });
      }

      // Add dispute
      await prisma.dispute.create({
        data: {
          userId: session.user.id,
          reportId,
        },
      });

      // Increment dispute count on report
      await prisma.report.update({
        where: { id: reportId },
        data: { disputeCount: { increment: 1 } },
      });

      const newCount = await prisma.dispute.count({
        where: { reportId },
      });

      return NextResponse.json({
        message: "Report disputed",
        disputed: true,
        disputeCount: newCount,
      });
    }
  } catch (error) {
    console.error("Error toggling dispute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
