import "dotenv/config";
import ws from "ws";
import bcrypt from "bcryptjs";
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
    { id: "type_file",    name: "Files",     icon: "File",       color: "#6b7280", isSystem: true },
    { id: "type_image",   name: "Images",    icon: "Image",      color: "#ec4899", isSystem: true },
    { id: "type_link",    name: "Links",     icon: "Link",       color: "#10b981", isSystem: true },
  ];

  for (const t of itemTypes) {
    await prisma.itemType.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  console.log(`✓ Seeded ${itemTypes.length} item types`);

  // ── User ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where:  { email: "demo@devstash.io" },
    update: {},
    create: {
      name:          "Demo User",
      email:         "demo@devstash.io",
      password:      passwordHash,
      isPro:         false,
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Seeded user: ${user.email}`);

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = [
    "react", "hooks", "typescript", "patterns",
    "ai", "prompts", "code-review",
    "docker", "ci-cd", "devops",
    "git", "shell", "npm",
    "css", "ui", "design",
  ];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    tags[name] = tag.id;
  }
  console.log(`✓ Seeded ${tagNames.length} tags`);

  // ── Collections ───────────────────────────────────────────────────────────
  const collections = [
    { id: "col_react",   name: "React Patterns",    description: "Reusable React patterns and hooks",          isFavorite: true,  defaultTypeId: "type_snippet" },
    { id: "col_ai",      name: "AI Workflows",       description: "AI prompts and workflow automations",        isFavorite: true,  defaultTypeId: "type_prompt"  },
    { id: "col_devops",  name: "DevOps",             description: "Infrastructure and deployment resources",    isFavorite: false, defaultTypeId: "type_snippet" },
    { id: "col_term",    name: "Terminal Commands",  description: "Useful shell commands for everyday development", isFavorite: true,  defaultTypeId: "type_command" },
    { id: "col_design",  name: "Design Resources",  description: "UI/UX resources and references",             isFavorite: false, defaultTypeId: "type_link"    },
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
    // React Patterns — 3 snippets
    {
      id:          "item_react_1",
      title:       "useDebounce Hook",
      contentType: ContentType.TEXT,
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
      description: "Debounces a rapidly-changing value by the given delay in ms",
      language:    "typescript",
      itemTypeId:  "type_snippet",
      isFavorite:  true,
      isPinned:    true,
      tags:        ["react", "hooks", "typescript"],
      collections: ["col_react"],
    },
    {
      id:          "item_react_2",
      title:       "Context Provider Pattern",
      contentType: ContentType.TEXT,
      content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}`,
      description: "Typed context + provider pattern with a custom hook guard",
      language:    "typescript",
      itemTypeId:  "type_snippet",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["react", "patterns", "typescript"],
      collections: ["col_react"],
    },
    {
      id:          "item_react_3",
      title:       "cn() Class Utility",
      contentType: ContentType.TEXT,
      content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      description: "Merges Tailwind classes safely — handles conflicts and conditional classes",
      language:    "typescript",
      itemTypeId:  "type_snippet",
      isFavorite:  true,
      isPinned:    false,
      tags:        ["react", "typescript"],
      collections: ["col_react"],
    },

    // AI Workflows — 3 prompts
    {
      id:          "item_ai_1",
      title:       "Senior Code Reviewer",
      contentType: ContentType.TEXT,
      content: `You are a senior software engineer conducting a thorough code review.

Review the following code for:
- Bugs and edge cases
- Security vulnerabilities (injection, auth, data exposure)
- Performance issues (N+1 queries, unnecessary re-renders, memory leaks)
- Readability and naming clarity
- Adherence to SOLID principles

For each issue found, provide:
1. The specific line or block
2. Why it's a problem
3. A concrete fix or improved version

Be direct. Prioritize critical issues over style.`,
      description: "Structured prompt for deep, actionable code reviews",
      language:    null,
      itemTypeId:  "type_prompt",
      isFavorite:  true,
      isPinned:    true,
      tags:        ["ai", "prompts", "code-review"],
      collections: ["col_ai"],
    },
    {
      id:          "item_ai_2",
      title:       "JSDoc Generator",
      contentType: ContentType.TEXT,
      content: `Generate JSDoc comments for the following TypeScript function.

Requirements:
- One-line summary (imperative mood, e.g. "Returns..." not "This function returns...")
- @param for every parameter with type and description
- @returns with type and description
- @throws if the function can throw
- @example with a realistic usage snippet

Only output the JSDoc block. Do not repeat or modify the function itself.`,
      description: "Generates accurate JSDoc for TypeScript functions",
      language:    null,
      itemTypeId:  "type_prompt",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ai", "prompts"],
      collections: ["col_ai"],
    },
    {
      id:          "item_ai_3",
      title:       "Refactoring Assistant",
      contentType: ContentType.TEXT,
      content: `You are an expert at improving code quality without changing behavior.

Refactor the following code to:
- Eliminate duplication (DRY)
- Improve naming for clarity
- Reduce nesting and cyclomatic complexity
- Extract pure functions where useful
- Preserve all existing behavior exactly

Constraints:
- Do NOT add new features
- Do NOT change the public API or function signatures
- Output only the refactored code, no explanation unless a decision is non-obvious`,
      description: "Refactors code for clarity and DRY without altering behavior",
      language:    null,
      itemTypeId:  "type_prompt",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ai", "prompts", "code-review"],
      collections: ["col_ai"],
    },

    // DevOps — 1 snippet, 1 command, 2 links
    {
      id:          "item_devops_1",
      title:       "GitHub Actions — Node.js CI",
      contentType: ContentType.TEXT,
      content: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test`,
      description: "Minimal GitHub Actions workflow for Node.js — install, build, test",
      language:    "yaml",
      itemTypeId:  "type_snippet",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ci-cd", "devops"],
      collections: ["col_devops"],
    },
    {
      id:          "item_devops_2",
      title:       "Docker — build and run",
      contentType: ContentType.TEXT,
      content:     "docker build -t my-app:latest . && docker run -p 3000:3000 --env-file .env my-app:latest",
      description: "Build a Docker image and run it with local env vars",
      language:    null,
      itemTypeId:  "type_command",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["docker", "devops"],
      collections: ["col_devops"],
    },
    {
      id:          "item_devops_3",
      title:       "Docker Documentation",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Official Docker docs — reference for Dockerfile syntax and CLI",
      language:    null,
      url:         "https://docs.docker.com",
      itemTypeId:  "type_link",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["docker", "devops"],
      collections: ["col_devops"],
    },
    {
      id:          "item_devops_4",
      title:       "GitHub Actions Docs",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Official GitHub Actions reference — workflows, triggers, and marketplace",
      language:    null,
      url:         "https://docs.github.com/en/actions",
      itemTypeId:  "type_link",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ci-cd", "devops"],
      collections: ["col_devops"],
    },

    // Terminal Commands — 4 commands
    {
      id:          "item_term_1",
      title:       "Git — undo last commit (keep changes)",
      contentType: ContentType.TEXT,
      content:     "git reset --soft HEAD~1",
      description: "Moves HEAD back one commit; staged changes are preserved",
      language:    null,
      itemTypeId:  "type_command",
      isFavorite:  true,
      isPinned:    false,
      tags:        ["git", "shell"],
      collections: ["col_term"],
    },
    {
      id:          "item_term_2",
      title:       "Docker — remove all stopped containers",
      contentType: ContentType.TEXT,
      content:     "docker container prune -f",
      description: "Silently removes every stopped container",
      language:    null,
      itemTypeId:  "type_command",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["docker", "shell"],
      collections: ["col_term"],
    },
    {
      id:          "item_term_3",
      title:       "Kill process on port",
      contentType: ContentType.TEXT,
      content:     "lsof -ti tcp:<PORT> | xargs kill -9",
      description: "Finds and force-kills whatever is listening on the given port",
      language:    null,
      itemTypeId:  "type_command",
      isFavorite:  true,
      isPinned:    true,
      tags:        ["shell"],
      collections: ["col_term"],
    },
    {
      id:          "item_term_4",
      title:       "npm — list outdated packages",
      contentType: ContentType.TEXT,
      content:     "npm outdated",
      description: "Shows current, wanted, and latest versions for all installed packages",
      language:    null,
      itemTypeId:  "type_command",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["npm", "shell"],
      collections: ["col_term"],
    },

    // Design Resources — 4 links
    {
      id:          "item_design_1",
      title:       "Tailwind CSS Docs",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Official Tailwind CSS v4 documentation — utilities, configuration, and plugins",
      language:    null,
      url:         "https://tailwindcss.com/docs",
      itemTypeId:  "type_link",
      isFavorite:  true,
      isPinned:    false,
      tags:        ["css", "design"],
      collections: ["col_design"],
    },
    {
      id:          "item_design_2",
      title:       "shadcn/ui Components",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Accessible component library built on Radix UI and Tailwind CSS",
      language:    null,
      url:         "https://ui.shadcn.com/docs/components",
      itemTypeId:  "type_link",
      isFavorite:  true,
      isPinned:    false,
      tags:        ["ui", "design"],
      collections: ["col_design"],
    },
    {
      id:          "item_design_3",
      title:       "Radix UI Primitives",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Unstyled, accessible component primitives for building design systems",
      language:    null,
      url:         "https://www.radix-ui.com/primitives",
      itemTypeId:  "type_link",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ui", "design"],
      collections: ["col_design"],
    },
    {
      id:          "item_design_4",
      title:       "Lucide Icons",
      contentType: ContentType.TEXT,
      content:     null,
      description: "Open-source icon library — searchable Lucide icons with React/SVG exports",
      language:    null,
      url:         "https://lucide.dev/icons",
      itemTypeId:  "type_link",
      isFavorite:  false,
      isPinned:    false,
      tags:        ["ui", "design"],
      collections: ["col_design"],
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
