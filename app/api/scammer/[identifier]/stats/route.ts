import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decodedIdentifier = decodeURIComponent(identifier);

    // Get all reports for this identifier
    const reports = await prisma.report.findMany({
      where: {
        identifier: {
          equals: decodedIdentifier,
          mode: "insensitive",
        },
      },
      include: {
        confirms: true,
        comments: true,
        bounties: true,
        evidenceItems: true,
        linkedWallets: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (reports.length === 0) {
      return NextResponse.json({ error: "Scammer not found" }, { status: 404 });
    }

    // Calculate stats
    const firstSeen = reports[0].createdAt;
    const lastSeen = reports[reports.length - 1].createdAt;
    const reportCount = reports.length;

    const totalConfirms = reports.reduce((acc, r) => acc + r.confirms.length, 0);
    const victimCount = reports.reduce(
      (acc, r) => acc + r.confirms.filter((c) => c.isVictim).length,
      0
    );
    const commentCount = reports.reduce((acc, r) => acc + r.comments.length, 0);
    const bountyCount = reports.reduce((acc, r) => acc + r.bounties.length, 0);
    const evidenceCount = reports.reduce(
      (acc, r) => acc + r.evidenceItems.length,
      0
    );
    const linkedWalletCount = reports.reduce(
      (acc, r) => acc + r.linkedWallets.length,
      0
    );

    // Get unique chains
    const chains = [...new Set(reports.map((r) => r.chain || "ETH"))];

    // Determine status based on last activity
    const daysSinceLastReport = Math.floor(
      (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: "active" | "dormant" | "inactive";
    if (daysSinceLastReport < 7) {
      status = "active";
    } else if (daysSinceLastReport < 30) {
      status = "dormant";
    } else {
      status = "inactive";
    }

    return NextResponse.json({
      identifier: decodedIdentifier,
      firstSeen,
      lastSeen,
      reportCount,
      totalConfirms,
      victimCount,
      commentCount,
      bountyCount,
      evidenceCount,
      linkedWalletCount,
      chains,
      status,
    });
  } catch (error) {
    console.error("Error fetching scammer stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
