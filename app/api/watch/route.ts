import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId } = body;

    // Check rate limit (1 per 2 seconds)
    const rateLimitResult = checkRateLimit(session.user.id, "watch", 2000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
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
