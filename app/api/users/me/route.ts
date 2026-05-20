import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

const ALLOWED_COLORS = [
  "#ff1744",
  "#ff9100",
  "#ffd600",
  "#69f0ae",
  "#00e5ff",
  "#2979ff",
  "#aa00ff",
  "#ff4081",
  "#ff6e40",
  "#76ff03",
  "#18ffff",
  "#e040fb",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nickname: true,
        bio: true,
        profileColor: true,
        title: true,
        xp: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, profileColor } = body;

    const updates: { bio?: string; profileColor?: string } = {};

    if (bio !== undefined) {
      const sanitizedBio = sanitizeInput(bio || "").slice(0, 280);
      updates.bio = sanitizedBio;
    }

    if (profileColor !== undefined) {
      if (!ALLOWED_COLORS.includes(profileColor)) {
        return NextResponse.json(
          { error: "Invalid profile color" },
          { status: 400 }
        );
      }
      updates.profileColor = profileColor;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        nickname: true,
        bio: true,
        profileColor: true,
        title: true,
        xp: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
