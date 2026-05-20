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
  console.log("Cleaning up existing demo data...");

  // Delete demo users and their related data (cascade will handle related records)
  const demoEmails = [
    "rugslayer@scamboard.test",
    "etherdetective@scamboard.test",
    "soliditysnitch@scamboard.test",
    "botbusterella@scamboard.test",
    "0xforensics@scamboard.test",
    "honeypothunter@scamboard.test",
    "txndiver@scamboard.test",
    "groupchatgremlin@scamboard.test",
  ];

  // Delete demo reports first (by id pattern)
  await prisma.report.deleteMany({
    where: { id: { startsWith: "demo-" } },
  });

  const demoNicknames = [
    "rugslayer",
    "etherdetective",
    "soliditysnitch",
    "botbusterella",
    "0xforensics",
    "honeypot_hunter",
    "txn_diver",
    "groupchatgremlin",
  ];

  // Delete demo users by email or nickname
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: demoEmails } },
        { nickname: { in: demoNicknames } },
      ],
    },
  });

  console.log("  Cleaned up existing demo data");

  console.log("Seeding subscammer categories...");

  for (const category of subscammerCategories) {
    await prisma.subscammer.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  Created/verified: ${category.name}`);
  }

  // Import bcrypt for password hashing
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  console.log("Seeding demo users...");

  // Create 8 demo users for Top 8 feature
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "rugslayer@scamboard.test" },
      update: {},
      create: {
        email: "rugslayer@scamboard.test",
        password: hashedPassword,
        nickname: "rugslayer",
        bio: "Professional rug hunter. I find scammers so you don't have to lose your bags. Been in crypto since 2017, seen every scam in the book.",
        profileColor: "#ff3b9a",
        title: "Scamboard Legend",
        xp: 4820,
        mood: "vengeful",
        specialty: "honeypot detection",
        currentlyDoing: "tracking a fresh rugger",
      },
    }),
    prisma.user.upsert({
      where: { email: "etherdetective@scamboard.test" },
      update: {},
      create: {
        email: "etherdetective@scamboard.test",
        password: hashedPassword,
        nickname: "etherdetective",
        bio: "On-chain forensics specialist. Following the money since 2021. If you rug, I will find you.",
        profileColor: "#7c5cff",
        title: "Certified Watchdog",
        xp: 3960,
        mood: "caffeinated",
        specialty: "wallet tracing",
        currentlyDoing: "analyzing wallet clusters",
      },
    }),
    prisma.user.upsert({
      where: { email: "soliditysnitch@scamboard.test" },
      update: {},
      create: {
        email: "soliditysnitch@scamboard.test",
        password: hashedPassword,
        nickname: "soliditysnitch",
        bio: "Smart contract auditor by day, scam hunter by night. I read bytecode for fun.",
        profileColor: "#34d399",
        title: "Rug Destroyer",
        xp: 2100,
        mood: "smug",
        specialty: "contract analysis",
        currentlyDoing: "decompiling suspicious contracts",
      },
    }),
    prisma.user.upsert({
      where: { email: "botbusterella@scamboard.test" },
      update: {},
      create: {
        email: "botbusterella@scamboard.test",
        password: hashedPassword,
        nickname: "botbusterella",
        bio: "I expose bot armies and fake engagement. Your shills don't fool me.",
        profileColor: "#f472b6",
        title: "Fraud Detective",
        xp: 1500,
        mood: "tired",
        specialty: "bot detection",
        currentlyDoing: "tracking shill networks",
      },
    }),
    prisma.user.upsert({
      where: { email: "0xforensics@scamboard.test" },
      update: {},
      create: {
        email: "0xforensics@scamboard.test",
        password: hashedPassword,
        nickname: "0xforensics",
        bio: "Blockchain investigator. Every transaction tells a story.",
        profileColor: "#22d3ee",
        title: "Scam Sniper",
        xp: 850,
        mood: "patient",
        specialty: "transaction analysis",
      },
    }),
    prisma.user.upsert({
      where: { email: "honeypothunter@scamboard.test" },
      update: {},
      create: {
        email: "honeypothunter@scamboard.test",
        password: hashedPassword,
        nickname: "honeypot_hunter",
        bio: "Specialized in detecting honeypot contracts before you ape in.",
        profileColor: "#facc15",
        title: "Rug Spotter",
        xp: 420,
        mood: "amused",
        specialty: "honeypot detection",
      },
    }),
    prisma.user.upsert({
      where: { email: "txndiver@scamboard.test" },
      update: {},
      create: {
        email: "txndiver@scamboard.test",
        password: hashedPassword,
        nickname: "txn_diver",
        bio: "Deep diving into transaction histories. No rug goes unnoticed.",
        profileColor: "#60a5fa",
        title: "Fresh Degen",
        xp: 150,
        mood: "curious",
        specialty: "transaction analysis",
      },
    }),
    prisma.user.upsert({
      where: { email: "groupchatgremlin@scamboard.test" },
      update: {},
      create: {
        email: "groupchatgremlin@scamboard.test",
        password: hashedPassword,
        nickname: "groupchatgremlin",
        bio: "I infiltrate scam Telegram groups and expose them from the inside.",
        profileColor: "#fb923c",
        title: "Fresh Degen",
        xp: 75,
        mood: "feral",
        specialty: "social engineering",
      },
    }),
  ]);

  console.log(`  Created ${users.length} demo users`);

  // Set up Top 8 relationships
  await prisma.user.update({
    where: { id: users[0].id },
    data: {
      topWatchdogIds: [users[1].id, users[2].id, users[3].id, users[4].id],
    },
  });

  await prisma.user.update({
    where: { id: users[1].id },
    data: {
      topWatchdogIds: [users[0].id, users[2].id, users[5].id, users[6].id, users[7].id],
    },
  });

  console.log("  Set up Top 8 relationships");

  // Get subscammer categories
  const rugpulls = await prisma.subscammer.findUnique({ where: { slug: "rugpulls" } });
  const honeypots = await prisma.subscammer.findUnique({ where: { slug: "honeypots" } });
  const twitterscams = await prisma.subscammer.findUnique({ where: { slug: "twitterscams" } });

  console.log("Seeding demo reports...");

  // Create demo reports with varied data
  const reports = await Promise.all([
    // Legendary scammer - many confirms
    prisma.report.upsert({
      where: { id: "demo-legendary-rug" },
      update: {},
      create: {
        id: "demo-legendary-rug",
        type: "deployer",
        identifier: "0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B",
        reason: "Serial rug puller known as 'The Rugnarok'. Same pattern every time: deploys token, builds hype on Telegram for 2-3 days, pulls LP within 1 hour of 'launch'. At least 14 tokens rugged with identical contract pattern. Estimated total damage: $1.2M+.\n\nKnown tokens: $MOONRUG, $BAGRUG, $JEETCOIN, $SAFERUG (ironically named), and many more.",
        evidence: "https://etherscan.io/address/0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B",
        chain: "ETH",
        authorId: users[0].id,
        subscammerId: rugpulls?.id,
        shameLocked: true,
        roastTitle: "the Rugnarok",
      },
    }),
    // SOL scammer
    prisma.report.upsert({
      where: { id: "demo-sol-rug" },
      update: {},
      create: {
        id: "demo-sol-rug",
        type: "deployer",
        identifier: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        reason: "Deployed MOONRUG token on Solana, pulled liquidity within 37 minutes after pumping on Twitter. Estimated 412 SOL stolen. Multiple wallets traced back to this deployer address through Tornado Cash.",
        evidence: "https://solscan.io/account/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        chain: "SOL",
        authorId: users[1].id,
        subscammerId: rugpulls?.id,
      },
    }),
    // Twitter scammer
    prisma.report.upsert({
      where: { id: "demo-twitter-scam" },
      update: {},
      create: {
        id: "demo-twitter-scam",
        type: "twitter",
        identifier: "cryptoalphagems",
        reason: "Fake alpha calls group. Charges 1 ETH for 'lifetime access' then posts public information from Twitter. Multiple victims report being blocked after complaints. Uses bot army to inflate engagement.",
        chain: "ETH",
        authorId: users[2].id,
        subscammerId: twitterscams?.id,
      },
    }),
    // Honeypot
    prisma.report.upsert({
      where: { id: "demo-honeypot" },
      update: {},
      create: {
        id: "demo-honeypot",
        type: "deployer",
        identifier: "0x42aeFf09812bB1c9aA4f8d11de2C29c66E901aaA",
        reason: "Classic honeypot contract. Hidden 100% sell tax that activates after 5 transactions. Contract has hidden mint function that was used to dump on buyers. Do NOT interact.",
        evidence: "https://bscscan.com/address/0x42aeFf09812bB1c9aA4f8d11de2C29c66E901aaA",
        chain: "BSC",
        authorId: users[3].id,
        subscammerId: honeypots?.id,
      },
    }),
    // Base scammer
    prisma.report.upsert({
      where: { id: "demo-base-rug" },
      update: {},
      create: {
        id: "demo-base-rug",
        type: "deployer",
        identifier: "0x9100c441D9eC4F2b81fEd4dfBb12CE6cD401fffe",
        reason: "Base chain rugger. Launched $BASEDOG with fake partnerships, accumulated 50 ETH in LP, then migrated liquidity to a different address and dumped.",
        chain: "BASE",
        authorId: users[4].id,
        subscammerId: rugpulls?.id,
      },
    }),
    // Another Twitter scammer
    prisma.report.upsert({
      where: { id: "demo-twitter-scam-2" },
      update: {},
      create: {
        id: "demo-twitter-scam-2",
        type: "twitter",
        identifier: "moonboi_dev",
        reason: "Shill account for multiple rug pulls. Promotes tokens, then deletes tweets after the rug. Has been linked to at least 8 rugged projects. Uses multiple sock puppet accounts.",
        chain: "SOL",
        authorId: users[5].id,
        subscammerId: twitterscams?.id,
      },
    }),
  ]);

  console.log(`  Created ${reports.length} demo reports`);

  // Create confirms (including victim confirms)
  console.log("Seeding confirms...");

  // Many confirms for the legendary scammer
  const confirmData = [];
  for (let i = 1; i < users.length; i++) {
    confirmData.push({
      userId: users[i].id,
      reportId: reports[0].id,
      isVictim: i < 4, // First 3 are victims
    });
  }

  // Add confirms to other reports
  confirmData.push(
    { userId: users[0].id, reportId: reports[1].id, isVictim: true },
    { userId: users[2].id, reportId: reports[1].id, isVictim: false },
    { userId: users[3].id, reportId: reports[1].id, isVictim: false },
    { userId: users[0].id, reportId: reports[2].id, isVictim: false },
    { userId: users[1].id, reportId: reports[2].id, isVictim: true },
    { userId: users[4].id, reportId: reports[2].id, isVictim: false },
    { userId: users[0].id, reportId: reports[3].id, isVictim: false },
    { userId: users[1].id, reportId: reports[3].id, isVictim: false },
    { userId: users[5].id, reportId: reports[4].id, isVictim: true },
    { userId: users[6].id, reportId: reports[4].id, isVictim: false },
  );

  await prisma.confirm.createMany({
    data: confirmData,
    skipDuplicates: true,
  });

  console.log(`  Created ${confirmData.length} confirms`);

  // Create threaded comments with votes
  console.log("Seeding comments...");

  const comment1 = await prisma.comment.create({
    data: {
      userId: users[1].id,
      reportId: reports[0].id,
      text: "I lost 2 ETH to this rugger. Can confirm the pattern - same deployment method every time. We need to track all linked wallets.",
    },
  });

  const comment1Reply = await prisma.comment.create({
    data: {
      userId: users[2].id,
      reportId: reports[0].id,
      parentId: comment1.id,
      text: "I've traced 3 wallets that funded this deployer. All came from Tornado Cash within 24 hours of deployment.",
    },
  });

  const comment1ReplyReply = await prisma.comment.create({
    data: {
      userId: users[0].id,
      reportId: reports[0].id,
      parentId: comment1Reply.id,
      text: "Good find! Adding these to the linked wallets section.",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      userId: users[3].id,
      reportId: reports[0].id,
      text: "The contract has a hidden admin function at line 218. Classic hidden mint that was used to dump.",
    },
  });

  await prisma.comment.createMany({
    data: [
      { userId: users[0].id, reportId: reports[1].id, text: "Same pattern as the MOONRUG deployer. Might be related." },
      { userId: users[4].id, reportId: reports[2].id, text: "Joined their Discord - nothing but public info. Total scam." },
      { userId: users[1].id, reportId: reports[3].id, text: "Confirmed honeypot. 100% sell tax kicks in after you buy." },
    ],
  });

  console.log("  Created threaded comments");

  // Add comment votes
  await prisma.commentVote.createMany({
    data: [
      { userId: users[0].id, commentId: comment1.id, value: 1 },
      { userId: users[2].id, commentId: comment1.id, value: 1 },
      { userId: users[3].id, commentId: comment1.id, value: 1 },
      { userId: users[4].id, commentId: comment1.id, value: 1 },
      { userId: users[0].id, commentId: comment1Reply.id, value: 1 },
      { userId: users[1].id, commentId: comment1Reply.id, value: 1 },
      { userId: users[3].id, commentId: comment2.id, value: 1 },
      { userId: users[4].id, commentId: comment2.id, value: 1 },
    ],
    skipDuplicates: true,
  });

  console.log("  Created comment votes");

  // Create linked wallets
  console.log("Seeding linked wallets...");

  await prisma.linkedWallet.createMany({
    data: [
      {
        identifier: "0x42aeFf09812bB1c9aA4f8d11de2C29c66E901aaA",
        type: "deployer",
        relationship: "funded primary - 9h pre-deploy",
        reportId: reports[0].id,
        userId: users[1].id,
        confirms: 12,
      },
      {
        identifier: "0x9100c441D9eC4F2b81fEd4dfBb12CE6cD401fffe",
        type: "deployer",
        relationship: "received drained LP",
        reportId: reports[0].id,
        userId: users[2].id,
        confirms: 8,
      },
      {
        identifier: "@moonboi_dev",
        type: "twitter",
        relationship: "twitter shill account",
        reportId: reports[0].id,
        userId: users[3].id,
        confirms: 15,
      },
      {
        identifier: "0x77abEEdc119fF1b1cE2cE3441b8a2c1F71eFe211",
        type: "deployer",
        relationship: "same deploy pattern",
        reportId: reports[0].id,
        userId: users[4].id,
        confirms: 4,
      },
    ],
  });

  console.log("  Created linked wallets");

  // Create evidence
  console.log("Seeding evidence...");

  await prisma.evidence.createMany({
    data: [
      {
        type: "tx",
        url: "https://etherscan.io/tx/0x123abc",
        source: "etherscan.io",
        summary: "LP migration - 1,247 ETH out",
        reportId: reports[0].id,
        userId: users[1].id,
      },
      {
        type: "screenshot",
        url: "https://archive.is/example1",
        source: "twitter",
        summary: '@rugnarok_dev - "lol" (deleted tweet)',
        reportId: reports[0].id,
        userId: users[2].id,
      },
      {
        type: "tx",
        url: "https://etherscan.io/tx/0x456def",
        source: "etherscan.io",
        summary: "Tornado Cash in - 9h pre-deploy",
        reportId: reports[0].id,
        userId: users[1].id,
      },
      {
        type: "graph",
        url: "https://platform.arkhamintelligence.com/example",
        source: "arkham",
        summary: "wallet cluster - 11 EOAs identified",
        reportId: reports[0].id,
        userId: users[3].id,
      },
      {
        type: "contract",
        url: "https://etherscan.io/address/0x123#code",
        source: "etherscan.io",
        summary: "hidden mint fn line 218",
        reportId: reports[0].id,
        userId: users[2].id,
      },
      {
        type: "tx",
        url: "https://solscan.io/tx/abc123",
        source: "solscan.io",
        summary: "LP drain - 412 SOL",
        reportId: reports[1].id,
        userId: users[0].id,
      },
    ],
  });

  console.log("  Created evidence");

  // Create roasts
  console.log("Seeding roasts...");

  const roast1 = await prisma.roast.create({
    data: {
      text: "the Rugnarok",
      authorId: users[1].id,
      reportId: reports[0].id,
    },
  });

  const roast2 = await prisma.roast.create({
    data: {
      text: "Liquidity? I hardly knew her",
      authorId: users[2].id,
      reportId: reports[0].id,
    },
  });

  await prisma.roast.createMany({
    data: [
      { text: "Master of Disappearing Acts", authorId: users[3].id, reportId: reports[0].id },
      { text: "SOL-less rugger", authorId: users[0].id, reportId: reports[1].id },
      { text: "Fake Alpha, Real Scammer", authorId: users[1].id, reportId: reports[2].id },
    ],
  });

  // Add roast votes
  await prisma.roastVote.createMany({
    data: [
      { userId: users[0].id, roastId: roast1.id },
      { userId: users[2].id, roastId: roast1.id },
      { userId: users[3].id, roastId: roast1.id },
      { userId: users[4].id, roastId: roast1.id },
      { userId: users[5].id, roastId: roast1.id },
      { userId: users[0].id, roastId: roast2.id },
      { userId: users[1].id, roastId: roast2.id },
    ],
    skipDuplicates: true,
  });

  console.log("  Created roasts with votes");

  // Create bounties
  console.log("Seeding bounties...");

  await prisma.bounty.createMany({
    data: [
      { userId: users[0].id, reportId: reports[0].id, message: "Putting up 1 ETH for anyone who can doxx this rugger" },
      { userId: users[1].id, reportId: reports[0].id, message: "Adding 0.5 ETH to the bounty pool" },
      { userId: users[3].id, reportId: reports[0].id, message: "Contributing 0.2 ETH" },
      { userId: users[0].id, reportId: reports[1].id, message: "50 USDC bounty for wallet connections" },
    ],
    skipDuplicates: true,
  });

  console.log("  Created bounties");

  // Create wall posts
  console.log("Seeding wall posts...");

  await prisma.wallPost.createMany({
    data: [
      { body: "Keep up the good work! You've saved so many people from getting rugged.", userId: users[0].id, authorId: users[1].id },
      { body: "Your contract analysis skills are insane. Thanks for the honeypot find!", userId: users[2].id, authorId: users[0].id },
      { body: "Welcome to the watchdog community! Together we make crypto safer.", userId: users[6].id, authorId: users[0].id },
      { body: "That Rugnarok investigation was legendary. Real detective work.", userId: users[0].id, authorId: users[2].id },
    ],
  });

  console.log("  Created wall posts");

  // Create watches
  console.log("Seeding watches...");

  await prisma.watch.createMany({
    data: [
      { userId: users[0].id, targetType: "scammer", targetId: "0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B" },
      { userId: users[1].id, targetType: "scammer", targetId: "0x8a3F19c4b6d2E14e0b9c81f9b73a4eAaC7d2901B" },
      { userId: users[2].id, targetType: "scammer", targetId: "cryptoalphagems" },
      { userId: users[0].id, targetType: "user", targetId: users[1].id },
      { userId: users[1].id, targetType: "user", targetId: users[0].id },
    ],
    skipDuplicates: true,
  });

  console.log("  Created watches");

  console.log("\n Seeding complete!");
  console.log("\nDemo accounts:");
  console.log("  Email: rugslayer@scamboard.test");
  console.log("  Email: etherdetective@scamboard.test");
  console.log("  Password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
