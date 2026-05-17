import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, ContentType } from "../src/generated/prisma/client/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Item Types (system) ───────────────────────────────────────────────────
  const itemTypes = [
    { id: "type_snippet", name: "Snippets",  icon: "Code",       color: "#3b82f6", isSystem: true },
    { id: "type_prompt",  name: "Prompts",   icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
    { id: "type_command", name: "Commands",  icon: "Terminal",   color: "#f97316", isSystem: true },
    { id: "type_note",    name: "Notes",     icon: "StickyNote", color: "#fde047", isSystem: true },
    { id: "type_link",    name: "Links",     icon: "Link",       color: "#10b981", isSystem: true },
    { id: "type_file",    name: "Files",     icon: "File",       color: "#6b7280", isSystem: true },
    { id: "type_image",   name: "Images",    icon: "Image",      color: "#ec4899", isSystem: true },
  ];

  for (const t of itemTypes) {
    await prisma.itemType.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  console.log(`✓ Seeded ${itemTypes.length} item types`);

  // ── User ──────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where:  { email: "demo@devstash.io" },
    update: {},
    create: { name: "John Doe", email: "demo@devstash.io", isPro: true },
  });
  console.log(`✓ Seeded user: ${user.email}`);

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = ["react", "auth", "hooks", "api", "error-handling", "git", "python", "list", "code-review", "ai"];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    tags[name] = tag.id;
  }
  console.log(`✓ Seeded ${tagNames.length} tags`);

  // ── Collections ───────────────────────────────────────────────────────────
  const collections = [
    { id: "col_1", name: "React Patterns",  description: "Common React patterns and hooks",     isFavorite: true,  defaultTypeId: "type_snippet" },
    { id: "col_2", name: "Python Snippets", description: "Useful Python code snippets",         isFavorite: false, defaultTypeId: "type_snippet" },
    { id: "col_3", name: "Context Files",   description: "AI context files for projects",       isFavorite: true,  defaultTypeId: "type_file"    },
    { id: "col_4", name: "Interview Prep",  description: "Technical interview preparation",     isFavorite: false, defaultTypeId: "type_note"    },
    { id: "col_5", name: "Git Commands",    description: "Frequently used git commands",        isFavorite: true,  defaultTypeId: "type_command" },
    { id: "col_6", name: "AI Prompts",      description: "Curated AI prompts for coding",      isFavorite: false, defaultTypeId: "type_prompt"  },
  ];

  for (const c of collections) {
    await prisma.collection.upsert({
      where:  { id: c.id },
      update: {},
      create: { ...c, userId: user.id },
    });
  }
  console.log(`✓ Seeded ${collections.length} collections`);

  // ── Items ─────────────────────────────────────────────────────────────────
  const items = [
    {
      id: "item_1",
      title: "useAuth Hook",
      contentType: ContentType.TEXT,
      content: "Custom authentication hook for React applications",
      description: "Custom authentication hook for React applications",
      language: "typescript",
      itemTypeId: "type_snippet",
      isFavorite: true,
      isPinned: true,
      lastUsedAt: new Date("2026-01-15"),
      createdAt:  new Date("2026-01-15"),
      tags: ["react", "auth", "hooks"],
      collections: ["col_1"],
    },
    {
      id: "item_2",
      title: "API Error Handling Pattern",
      contentType: ContentType.TEXT,
      content: "Fetch wrapper with exponential backoff retry logic",
      description: "Fetch wrapper with exponential backoff retry logic",
      language: "typescript",
      itemTypeId: "type_snippet",
      isFavorite: false,
      isPinned: true,
      lastUsedAt: new Date("2026-01-12"),
      createdAt:  new Date("2026-01-12"),
      tags: ["api", "error-handling"],
      collections: ["col_1"],
    },
    {
      id: "item_3",
      title: "Git stash with message",
      contentType: ContentType.TEXT,
      content: "git stash push -m 'my stash message'",
      description: null,
      language: null,
      itemTypeId: "type_command",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-01-10"),
      createdAt:  new Date("2026-01-10"),
      tags: ["git"],
      collections: ["col_5"],
    },
    {
      id: "item_4",
      title: "Python list comprehension",
      contentType: ContentType.TEXT,
      content: "[x for x in range(10) if x % 2 == 0]",
      description: null,
      language: "python",
      itemTypeId: "type_snippet",
      isFavorite: false,
      isPinned: false,
      lastUsedAt: new Date("2026-01-08"),
      createdAt:  new Date("2026-01-08"),
      tags: ["python", "list"],
      collections: ["col_2"],
    },
    {
      id: "item_5",
      title: "Act as a senior code reviewer",
      contentType: ContentType.TEXT,
      content: "You are a senior engineer. Review the following code for bugs, performance, and security issues.",
      description: null,
      language: null,
      itemTypeId: "type_prompt",
      isFavorite: true,
      isPinned: false,
      lastUsedAt: new Date("2026-01-05"),
      createdAt:  new Date("2026-01-05"),
      tags: ["code-review", "ai"],
      collections: ["col_6"],
    },
  ];

  for (const { tags: itemTags, collections: itemCollections, ...data } of items) {
    await prisma.item.upsert({
      where:  { id: data.id },
      update: {},
      create: { ...data, userId: user.id },
    });

    for (const tagName of itemTags) {
      await prisma.tagsOnItems.upsert({
        where:  { itemId_tagId: { itemId: data.id, tagId: tags[tagName] } },
        update: {},
        create: { itemId: data.id, tagId: tags[tagName] },
      });
    }

    for (const collectionId of itemCollections) {
      await prisma.itemCollection.upsert({
        where:  { itemId_collectionId: { itemId: data.id, collectionId } },
        update: {},
        create: { itemId: data.id, collectionId },
      });
    }
  }
  console.log(`✓ Seeded ${items.length} items with tags and collection links`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
