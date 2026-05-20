import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Extended color palette for the hybrid redesign
const ALLOWED_COLORS = [
  "#ff3b6c", // red (primary)
  "#ff3b9a", // hot pink
  "#ff7a3a", // orange
  "#ffc547", // gold
  "#6ce28a", // green
  "#5cd0e2", // cyan
  "#b58aff", // purple
  "#7c5cff", // deep purple
  "#34d399", // emerald
  "#22d3ee", // sky cyan
  "#f472b6", // pink
  "#fb923c", // amber
  "#facc15", // yellow
  "#60a5fa", // blue
  // Legacy colors for backward compatibility
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
            roasts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
      createdAt: user.createdAt,
      reportCount: user._count.reports,
      confirmCount: user._count.confirms,
      roastsWon: 0, // TODO: calculate properly
    });
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
    const {
      bio,
      profileColor,
      mood,
      currentlyDoing,
      specialty,
      themeSongUrl,
      themeSongLabel,
    } = body;

    const updates: Record<string, string | null> = {};

    // Bio (max 280 chars)
    if (bio !== undefined) {
      const sanitizedBio = sanitizeInput(bio || "").slice(0, 280);
      updates.bio = sanitizedBio;
    }

    // Profile color
    if (profileColor !== undefined) {
      if (!ALLOWED_COLORS.includes(profileColor)) {
        return NextResponse.json(
          { error: "Invalid profile color" },
          { status: 400 }
        );
      }
      updates.profileColor = profileColor;
    }

    // Mood (max 60 chars)
    if (mood !== undefined) {
      const sanitizedMood = sanitizeInput(mood || "").slice(0, 60);
      updates.mood = sanitizedMood || "vibing";
    }

    // Currently doing (max 60 chars)
    if (currentlyDoing !== undefined) {
      const sanitizedCurrently = sanitizeInput(currentlyDoing || "").slice(0, 60);
      updates.currentlyDoing = sanitizedCurrently;
    }

    // Specialty (max 60 chars)
    if (specialty !== undefined) {
      const sanitizedSpecialty = sanitizeInput(specialty || "").slice(0, 60);
      updates.specialty = sanitizedSpecialty;
    }

    // Theme song URL (must be a valid URL or empty)
    if (themeSongUrl !== undefined) {
      if (themeSongUrl && themeSongUrl.length > 0) {
        try {
          new URL(themeSongUrl);
          updates.themeSongUrl = themeSongUrl.slice(0, 500);
        } catch {
          return NextResponse.json(
            { error: "Invalid theme song URL" },
            { status: 400 }
          );
        }
      } else {
        updates.themeSongUrl = null;
      }
    }

    // Theme song label (max 100 chars)
    if (themeSongLabel !== undefined) {
      const sanitizedLabel = sanitizeInput(themeSongLabel || "").slice(0, 100);
      updates.themeSongLabel = sanitizedLabel || null;
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
        mood: true,
        currentlyDoing: true,
        specialty: true,
        themeSongUrl: true,
        themeSongLabel: true,
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
