import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const demo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });

  if (!demo) {
    console.error(`❌ Demo user "${DEMO_EMAIL}" not found. Aborting.`);
    process.exit(1);
  }

  const demoId = demo.id;
  console.log(`Demo user found (${demoId}) — all other users will be deleted.\n`);

  const otherUsers = await prisma.user.findMany({
    where: { id: { not: demoId } },
    select: { id: true, email: true },
  });

  if (otherUsers.length === 0) {
    console.log("✓ No non-demo users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${otherUsers.length} user(s) to delete:`);
  otherUsers.forEach((u) => console.log(`  • ${u.email ?? u.id}`));
  console.log();

  const userIds = otherUsers.map((u) => u.id);

  // Delete junction rows for items belonging to non-demo users first
  const deletedTagsOnItems = await prisma.tagsOnItems.deleteMany({
    where: { item: { userId: { in: userIds } } },
  });
  console.log(`  tags_on_items:   ${deletedTagsOnItems.count} rows`);

  const deletedItemCollections = await prisma.itemCollection.deleteMany({
    where: { item: { userId: { in: userIds } } },
  });
  console.log(`  item_collections: ${deletedItemCollections.count} rows`);

  const deletedItems = await prisma.item.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`  items:            ${deletedItems.count} rows`);

  const deletedCollections = await prisma.collection.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`  collections:      ${deletedCollections.count} rows`);

  // Only delete custom item types (system types have userId = null)
  const deletedItemTypes = await prisma.itemType.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`  item_types:       ${deletedItemTypes.count} rows`);

  const deletedSessions = await prisma.session.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`  sessions:         ${deletedSessions.count} rows`);

  const deletedAccounts = await prisma.account.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`  accounts:         ${deletedAccounts.count} rows`);

  const deletedVerifTokens = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: otherUsers.map((u) => u.email ?? "") } },
  });
  console.log(`  verification_tokens: ${deletedVerifTokens.count} rows`);

  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`  users:            ${deletedUsers.count} rows`);

  console.log(`\n✓ Deleted ${deletedUsers.count} user(s). Demo user preserved.`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
