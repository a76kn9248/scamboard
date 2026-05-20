import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subscammerCategories = [
  { slug: "rugpulls", name: "Rug Pulls", description: "Classic rug pull scams - LP removed or tokens dumped" },
  { slug: "honeypots", name: "Honeypots", description: "Contracts that prevent selling or have hidden taxes" },
  { slug: "twitterscams", name: "Twitter Scams", description: "Fake alpha callers, bot armies, and shill networks" },
  { slug: "alphafrauds", name: "Alpha Frauds", description: "Paid groups selling public or fake alpha" },
  { slug: "bridgehacks", name: "Bridge Hacks", description: "Bridge exploits and cross-chain attacks" },
  { slug: "discord_scams", name: "Discord Scams", description: "Fake Discord servers, phishing links, and mod compromises" },
  { slug: "under_investigation", name: "Under Investigation", description: "Active investigations with developing evidence" },
];

async function main() {
  console.log("Seeding subscammer categories...");

  for (const category of subscammerCategories) {
    await prisma.subscammer.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  Created/verified: ${category.name}`);
  }

  // Check if we need to seed demo data
  const existingReports = await prisma.report.count();
  if (existingReports < 3) {
    console.log("Seeding demo data...");

    // Create a demo user if none exists
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("demo1234", 10);

    const demoUser = await prisma.user.upsert({
      where: { email: "demo@scamboard.test" },
      update: {},
      create: {
        email: "demo@scamboard.test",
        password: hashedPassword,
        nickname: "rugslayer",
        bio: "Professional rug hunter. I find scammers so you don't have to lose your bags.",
        profileColor: "#ff3b9a",
        title: "Bounty Hunter",
        xp: 4820,
        mood: "vengeful",
        specialty: "honeypot detection",
      },
    });

    const demoUser2 = await prisma.user.upsert({
      where: { email: "demo2@scamboard.test" },
      update: {},
      create: {
        email: "demo2@scamboard.test",
        password: hashedPassword,
        nickname: "etherdetective",
        bio: "On-chain forensics specialist. Following the money since 2021.",
        profileColor: "#7c5cff",
        title: "Watchdog",
        xp: 3960,
        mood: "caffeinated",
        specialty: "wallet tracing",
      },
    });

    console.log("  Created demo users");

    // Create demo reports
    const rugpulls = await prisma.subscammer.findUnique({ where: { slug: "rugpulls" } });
    const twitterscams = await prisma.subscammer.findUnique({ where: { slug: "twitterscams" } });

    const report1 = await prisma.report.upsert({
      where: { id: "demo-report-1" },
      update: {},
      create: {
        id: "demo-report-1",
        type: "deployer",
        identifier: "0x742d35Cc6634C0532925a3b844Bc9e7595f5ab12",
        reason: "Deployed MOONRUG token on Solana, pulled liquidity within 37 minutes after pumping on Twitter. Estimated 412 SOL stolen. Multiple wallets traced back to this deployer address.",
        evidence: "https://solscan.io/tx/example",
        chain: "SOL",
        authorId: demoUser.id,
        subscammerId: rugpulls?.id,
      },
    });

    const report2 = await prisma.report.upsert({
      where: { id: "demo-report-2" },
      update: {},
      create: {
        id: "demo-report-2",
        type: "twitter",
        identifier: "cryptoalphagems",
        reason: "Fake alpha calls group. Charges 1 ETH for 'lifetime access' then posts public information from Twitter. Multiple victims report being blocked after complaints.",
        chain: "ETH",
        authorId: demoUser2.id,
        subscammerId: twitterscams?.id,
      },
    });

    const report3 = await prisma.report.upsert({
      where: { id: "demo-report-3" },
      update: {},
      create: {
        id: "demo-report-3",
        type: "deployer",
        identifier: "0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B",
        reason: "Serial rug puller. Same pattern: deploys token, builds hype on Telegram, pulls LP within 1 hour. At least 14 tokens rugged with identical contract pattern.",
        evidence: "https://etherscan.io/address/example",
        chain: "ETH",
        authorId: demoUser.id,
        subscammerId: rugpulls?.id,
      },
    });

    console.log("  Created demo reports");

    // Add some confirms
    await prisma.confirm.createMany({
      data: [
        { userId: demoUser2.id, reportId: report1.id },
        { userId: demoUser.id, reportId: report2.id },
        { userId: demoUser2.id, reportId: report3.id },
      ],
      skipDuplicates: true,
    });

    console.log("  Created demo confirms");

    // Add some comments
    await prisma.comment.createMany({
      data: [
        { userId: demoUser2.id, reportId: report1.id, text: "I lost 2 SOL to this rug. Can confirm the LP pull." },
        { userId: demoUser.id, reportId: report2.id, text: "Joined their Discord - nothing but public info. Total scam." },
      ],
      skipDuplicates: true,
    });

    console.log("  Created demo comments");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
