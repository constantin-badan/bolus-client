import {
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Person/user who tracks habits
export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Habit definition with type and settings
export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type", { enum: ["boolean", "budget"] }).notNull(),
  // Settings stored as JSONB for flexibility
  // For budget type: { dailyLimit: 35, weekendLimit: 100, burnPercentage: 50 }
  // For boolean type: {}
  settings: jsonb("settings").notNull().default({}),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Track habit completion per person per day
export const habitEntries = pgTable(
  "habit_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    // For boolean habits: "green" | "red" | "neutral" | "skipped"
    // For budget habits: "green" (under/on budget) | "red" (over budget) | "neutral" (not tracked)
    status: text("status", { enum: ["green", "red", "neutral", "skipped"] })
      .notNull()
      .default("neutral"),
    // For budget habits
    amountSpent: numeric("amount_spent", { precision: 10, scale: 2 }),
    availableBalance: numeric("available_balance", { precision: 10, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint: one entry per person per habit per day
    uniquePersonHabitDate: unique().on(
      table.personId,
      table.habitId,
      table.date,
    ),
  }),
);

// Track which weekend day (Sat or Sun) gets the bonus limit
export const weekendChoices = pgTable(
  "weekend_choices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(), // Monday of the week
    chosenDay: text("chosen_day", { enum: ["saturday", "sunday"] }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // One choice per person per habit per week
    uniquePersonHabitWeek: unique().on(
      table.personId,
      table.habitId,
      table.weekStart,
    ),
  }),
);
