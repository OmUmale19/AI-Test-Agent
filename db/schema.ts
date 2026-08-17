import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Repo = typeof repos.$inferSelect;
export type NewRepo = typeof repos.$inferInsert;

