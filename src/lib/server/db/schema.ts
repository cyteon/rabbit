import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerk_id: text("clerk_id").notNull().unique(),
  votes: text("votes").notNull().default("{}"),
});

export const subrabbits = pgTable("subrabbits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  owner: integer("owner").references(() => users.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  id_rand: text("id_rand").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subrabbit: integer("subrabbit").references(() => subrabbits.id),
  subrabbit_name: text("subrabbit_name").notNull(),
  author: integer("author").references(() => users.id),
  author_clerk_id: text("author_clerk_id").notNull(),
  votes: integer("votes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  id_rand: text("id_rand").notNull().unique(),
  content: text("content").notNull(),
  post: integer("post").references(() => posts.id),
  author: integer("author").references(() => users.id),
  author_clerk_id: text("author_clerk_id").notNull(),
  votes: integer("votes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
