import { prisma } from './prisma';

export const XP_REWARDS = {
  SUBMIT_REPORT: 10,
  CONFIRM_SCAMMER: 2,
  LEAVE_COMMENT: 3,
  SUBMIT_ROAST: 5,
  ROAST_WINS: 25,
  ADD_BOUNTY: 5,
  ADD_LINKED_WALLET: 5,
  ADD_EVIDENCE: 5,
  CONFIRM_LINKED_WALLET: 2,
  VICTIM_CONFIRM: 5,
} as const;

export const TITLE_THRESHOLDS = [
  { xp: 0, title: "Fresh Degen" },
  { xp: 25, title: "Rug Spotter" },
  { xp: 75, title: "Scam Sniper" },
  { xp: 150, title: "Fraud Detective" },
  { xp: 300, title: "Rug Destroyer" },
  { xp: 500, title: "Certified Watchdog" },
  { xp: 1000, title: "Scamboard Legend" },
] as const;

export function getTitleForXP(xp: number): string {
  let title: string = TITLE_THRESHOLDS[0].title;
  for (const threshold of TITLE_THRESHOLDS) {
    if (xp >= threshold.xp) {
      title = threshold.title;
    } else {
      break;
    }
  }
  return title;
}

export function getNextTitleThreshold(xp: number): { nextTitle: string; xpNeeded: number; progress: number } | null {
  for (let i = 0; i < TITLE_THRESHOLDS.length; i++) {
    if (xp < TITLE_THRESHOLDS[i].xp) {
      const prevXp = i > 0 ? TITLE_THRESHOLDS[i - 1].xp : 0;
      const currentLevelXp = xp - prevXp;
      const xpForNextLevel = TITLE_THRESHOLDS[i].xp - prevXp;
      return {
        nextTitle: TITLE_THRESHOLDS[i].title,
        xpNeeded: TITLE_THRESHOLDS[i].xp - xp,
        progress: (currentLevelXp / xpForNextLevel) * 100,
      };
    }
  }
  return null; // Already at max level
}

export async function awardXP(userId: string, amount: number): Promise<{ newXp: number; newTitle: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, title: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newXp = user.xp + amount;
  const newTitle = getTitleForXP(newXp);
  const titleChanged = newTitle !== user.title;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      title: newTitle,
    },
  });

  return {
    newXp,
    newTitle: titleChanged ? newTitle : null,
  };
}
