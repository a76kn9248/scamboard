import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, turnstileToken } = body;

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

    // Validate input
    if (!targetType || !["scammer", "user"].includes(targetType)) {
      return NextResponse.json(
        { error: "targetType must be 'scammer' or 'user'" },
        { status: 400 }
      );
    }

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { error: "targetId is required" },
        { status: 400 }
      );
    }

    // Can't watch yourself
    if (targetType === "user" && targetId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot watch yourself" },
        { status: 400 }
      );
    }

    // Check if already watching
    const existingWatch = await prisma.watch.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existingWatch) {
      // Toggle off - remove watch
      await prisma.watch.delete({
        where: { id: existingWatch.id },
      });

      return NextResponse.json({
        message: "Stopped watching",
        watching: false,
      });
    } else {
      // Add watch
      await prisma.watch.create({
        data: {
          userId: session.user.id,
          targetType,
          targetId,
        },
      });

      return NextResponse.json({
        message: "Now watching",
        watching: true,
      });
    }
  } catch (error) {
    console.error("Error toggling watch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
