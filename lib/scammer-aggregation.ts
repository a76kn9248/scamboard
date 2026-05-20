import { prisma } from './prisma';

export interface AggregatedScammer {
  identifier: string;
  type: string;
  totalConfirms: number;
  victimCount: number;
  weightedScore: number; // totalConfirms + victimCount (victims count 2x)
  reportCount: number;
  reports: {
    id: string;
    reason: string;
    evidence: string | null;
    authorNickname: string;
    createdAt: Date;
    confirmCount: number;
    victimCount: number;
    commentCount: number;
  }[];
  roastTitle: string | null;
  shameLocked: boolean;
  firstReportDate: Date;
  latestReportDate: Date;
}

export async function getAggregatedScammer(identifier: string): Promise<AggregatedScammer | null> {
  const reports = await prisma.report.findMany({
    where: { identifier: { equals: identifier, mode: 'insensitive' } },
    include: {
      author: { select: { nickname: true } },
      confirms: true,
      comments: true,
      roasts: {
        include: {
          votes: true,
        },
        orderBy: {
          votes: { _count: 'desc' },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (reports.length === 0) return null;

  const totalConfirms = reports.reduce((sum, r) => sum + r.confirms.length, 0);
  const victimCount = reports.reduce((sum, r) => sum + r.confirms.filter(c => c.isVictim).length, 0);
  const weightedScore = totalConfirms + victimCount; // victims count 2x (once in totalConfirms, once here)

  // Find the locked roast title or the top voted roast
  let roastTitle: string | null = null;
  let shameLocked = false;

  for (const report of reports) {
    if (report.shameLocked && report.roastTitle) {
      roastTitle = report.roastTitle;
      shameLocked = true;
      break;
    }
  }

  // If no locked roast, find the top voted one across all reports
  if (!roastTitle) {
    const allRoasts = reports.flatMap(r => r.roasts);
    if (allRoasts.length > 0) {
      const topRoast = allRoasts.sort((a, b) => b.votes.length - a.votes.length)[0];
      if (topRoast.votes.length > 0) {
        roastTitle = topRoast.text;
      }
    }
  }

  const dates = reports.map(r => r.createdAt);

  return {
    identifier: reports[0].identifier,
    type: reports[0].type,
    totalConfirms,
    victimCount,
    weightedScore,
    reportCount: reports.length,
    reports: reports.map(r => ({
      id: r.id,
      reason: r.reason,
      evidence: r.evidence,
      authorNickname: r.author.nickname,
      createdAt: r.createdAt,
      confirmCount: r.confirms.length,
      victimCount: r.confirms.filter(c => c.isVictim).length,
      commentCount: r.comments.length,
    })),
    roastTitle,
    shameLocked,
    firstReportDate: new Date(Math.min(...dates.map(d => d.getTime()))),
    latestReportDate: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
}

export async function getTopScammers(limit: number = 10): Promise<AggregatedScammer[]> {
  // Get all reports with their confirms
  const reports = await prisma.report.findMany({
    include: {
      author: { select: { nickname: true } },
      confirms: true,
      comments: true,
    },
  });

  // Group by identifier (case-insensitive)
  const scammerMap = new Map<string, typeof reports>();

  for (const report of reports) {
    const key = report.identifier.toLowerCase();
    if (!scammerMap.has(key)) {
      scammerMap.set(key, []);
    }
    scammerMap.get(key)!.push(report);
  }

  // Calculate totals and sort by weighted score (victims count 2x)
  const scammers: { identifier: string; totalConfirms: number; victimCount: number; weightedScore: number; reports: typeof reports }[] = [];

  for (const [, reportGroup] of scammerMap) {
    const totalConfirms = reportGroup.reduce((sum, r) => sum + r.confirms.length, 0);
    const victimCount = reportGroup.reduce((sum, r) => sum + r.confirms.filter(c => c.isVictim).length, 0);
    const weightedScore = totalConfirms + victimCount; // victims count 2x
    scammers.push({
      identifier: reportGroup[0].identifier,
      totalConfirms,
      victimCount,
      weightedScore,
      reports: reportGroup,
    });
  }

  // Sort by weighted score (victims count double)
  scammers.sort((a, b) => b.weightedScore - a.weightedScore);

  // Get top N with full details
  const topScammers: AggregatedScammer[] = [];

  for (const scammer of scammers.slice(0, limit)) {
    // Fetch roast titles
    const roasts = await prisma.roast.findMany({
      where: {
        report: {
          identifier: { equals: scammer.identifier, mode: 'insensitive' },
        },
      },
      include: { votes: true },
      orderBy: { votes: { _count: 'desc' } },
    });

    let roastTitle: string | null = null;
    let shameLocked = false;

    // Check for locked roast
    for (const report of scammer.reports) {
      if (report.shameLocked && report.roastTitle) {
        roastTitle = report.roastTitle;
        shameLocked = true;
        break;
      }
    }

    if (!roastTitle && roasts.length > 0 && roasts[0].votes.length > 0) {
      roastTitle = roasts[0].text;
    }

    const dates = scammer.reports.map(r => r.createdAt);

    topScammers.push({
      identifier: scammer.identifier,
      type: scammer.reports[0].type,
      totalConfirms: scammer.totalConfirms,
      victimCount: scammer.victimCount,
      weightedScore: scammer.weightedScore,
      reportCount: scammer.reports.length,
      reports: scammer.reports.map(r => ({
        id: r.id,
        reason: r.reason,
        evidence: r.evidence,
        authorNickname: r.author.nickname,
        createdAt: r.createdAt,
        confirmCount: r.confirms.length,
        victimCount: r.confirms.filter(c => c.isVictim).length,
        commentCount: r.comments.length,
      })),
      roastTitle,
      shameLocked,
      firstReportDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      latestReportDate: new Date(Math.max(...dates.map(d => d.getTime()))),
    });
  }

  return topScammers;
}

export async function getHallOfInfamy(limit: number = 50): Promise<AggregatedScammer[]> {
  const topScammers = await getTopScammers(1000); // Get all, then filter
  return topScammers.filter(s => s.totalConfirms >= 25).slice(0, limit);
}

export async function getTotalConfirmsForIdentifier(identifier: string): Promise<number> {
  const result = await prisma.confirm.count({
    where: {
      report: {
        identifier: { equals: identifier, mode: 'insensitive' },
      },
    },
  });
  return result;
}
