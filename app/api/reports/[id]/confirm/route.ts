import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";

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

    const body = await request.json();
    const { turnstileToken } = body;

    // Verify Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Bot verification required" },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Bot verification failed" },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user is the author (can't confirm own report)
    if (report.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot confirm your own report" },
        { status: 400 }
      );
    }

    // Check if already confirmed
    const existingConfirm = await prisma.confirm.findUnique({
      where: {
        userId_reportId: {
          userId: session.user.id,
          reportId,
        },
      },
    });

    if (existingConfirm) {
      // Toggle off - remove confirm
      await prisma.confirm.delete({
        where: { id: existingConfirm.id },
      });

      const newCount = await prisma.confirm.count({
        where: { reportId },
      });

      return NextResponse.json({
        message: "Confirm removed",
        confirmed: false,
        confirmCount: newCount,
      });
    } else {
      // Add confirm
      await prisma.confirm.create({
        data: {
          userId: session.user.id,
          reportId,
        },
      });

      const newCount = await prisma.confirm.count({
        where: { reportId },
      });

      return NextResponse.json({
        message: "Report confirmed",
        confirmed: true,
        confirmCount: newCount,
      });
    }
  } catch (error) {
    console.error("Error toggling confirm:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
