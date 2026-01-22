import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const habitEntries = pgTable("habit_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().unique(),
  status: text("status", { enum: ["green", "red", "neutral", "skipped"] })
    .notNull()
    .default("neutral"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
