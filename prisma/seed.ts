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
