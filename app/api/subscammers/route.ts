import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/subscammers - List all communities
export async function GET() {
  try {
    const subscammers = await prisma.subscammer.findMany({
      orderBy: { slug: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        _count: {
          select: { reports: true },
        },
      },
    });

    return NextResponse.json({
      subscammers: subscammers.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        reportCount: s._count.reports,
      })),
    });
  } catch (error) {
    console.error("Error fetching subscammers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/subscammers - Create a new community
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Rate limit: 1 new community per user per day (86400000ms = 24 hours)
    const rateLimitResult = checkRateLimit(session.user.id, "create-community", 86400000);
    if (!rateLimitResult.allowed) {
      const hoursRemaining = Math.ceil((rateLimitResult.retryAfter || 0) / 3600);
      return NextResponse.json(
        { error: `You can only create one community per day. Try again in ${hoursRemaining} hours.` },
        { status: 429 }
      );
    }

    // Validate name
    const sanitizedName = sanitizeInput(name || "").trim();
    if (!sanitizedName || sanitizedName.length < 2 || sanitizedName.length > 30) {
      return NextResponse.json(
        { error: "Community name must be 2-30 characters" },
        { status: 400 }
      );
    }

    // Generate slug from name (lowercase, spaces to underscores, strip special chars)
    const slug = sanitizedName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    if (slug.length < 2) {
      return NextResponse.json(
        { error: "Community name must contain at least 2 alphanumeric characters" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.subscammer.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A community with this name already exists" },
        { status: 400 }
      );
    }

    // Sanitize description
    const sanitizedDescription = description ? sanitizeInput(description).slice(0, 200) : null;

    // Create the new community
    const subscammer = await prisma.subscammer.create({
      data: {
        slug,
        name: sanitizedName,
        description: sanitizedDescription,
      },
    });

    return NextResponse.json(
      {
        message: "Community created",
        subscammer: {
          id: subscammer.id,
          slug: subscammer.slug,
          name: subscammer.name,
          description: subscammer.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subscammer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
