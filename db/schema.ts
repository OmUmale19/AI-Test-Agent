import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits: integer("credits").default(100).notNull(),
});

export const repos = pgTable("repos", {
  id: serial("id").primaryKey(),
  user_email: text("user_email").notNull(),
  github_repo_id: integer("github_repo_id"),
  repo_name: text("repo_name").notNull(),
  full_name: text("full_name").notNull(),
  private: boolean("private").default(false).notNull(),
  html_url: text("html_url").notNull(),
  description: text("description"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  language: text("language"),
  default_branch: text("default_branch").notNull(),
  owner: text("owner").notNull(),
  status: text("status").default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const TestCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),

  // User / project details
  userId: varchar("user_id", { length: 255 }).notNull(),
  repoId: integer("repo_id"),
  repoName: varchar("repo_name", { length: 255 }).notNull(),
  repoOwner: varchar("repo_owner", { length: 255 }).notNull(),
  branch: varchar("branch", { length: 100 }).default("main"),

  // Main test case data
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),

  // Important metadata for code generation
  targetRoute: varchar("target_route", { length: 500 }),
  targetFiles: jsonb("target_files").$type<string[]>().default([]),
  expectedResult: text("expected_result"),

  // Later you can update these fields
  browserbaseScript: text("browserbase_script"),
  status: varchar("status", { length: 100 }).default("generated"),

  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Repo = typeof repos.$inferSelect;
export type NewRepo = typeof repos.$inferInsert;

export type TestCase = typeof TestCasesTable.$inferSelect;
export type NewTestCase = typeof TestCasesTable.$inferInsert;

