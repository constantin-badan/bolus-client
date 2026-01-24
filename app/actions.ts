"use server";

import { format, getDay, parseISO, startOfWeek, subDays } from "date-fns";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { habitEntries, habits, persons, weekendChoices } from "~/db/schema";

export type DayStatus = "green" | "red" | "neutral" | "skipped";
export type HabitType = "boolean" | "budget";

export interface Person {
  id: string;
  name: string;
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  settings: BudgetHabitSettings | Record<string, never>;
  order: number;
}

export interface BudgetHabitSettings {
  dailyLimit: number;
  weekendLimit: number;
  burnPercentage: number;
}

export interface HabitEntry {
  id: string;
  personId: string;
  habitId: string;
  date: string;
  status: DayStatus;
  amountSpent: string | null;
  availableBalance: string | null;
}

export interface WeekendChoice {
  id: string;
  personId: string;
  habitId: string;
  weekStart: string;
  chosenDay: "saturday" | "sunday";
}

// Get all persons
export async function getPersons(): Promise<Person[]> {
  const result = await db.select().from(persons);
  return result.map((p) => ({
    id: p.id,
    name: p.name,
  }));
}

// Get all habits
export async function getHabits(): Promise<Habit[]> {
  const result = await db
    .select()
    .from(habits)
    .orderBy(sql`${habits.order} ASC`);

  return result.map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type as HabitType,
    settings: h.settings as BudgetHabitSettings | Record<string, never>,
    order: h.order,
  }));
}

// Get habit entries for a person
export async function getHabitEntriesForPerson(
  personId: string,
): Promise<Record<string, Record<string, HabitEntry>>> {
  const entries = await db
    .select()
    .from(habitEntries)
    .where(eq(habitEntries.personId, personId));

  // Group by habit, then by date
  const grouped: Record<string, Record<string, HabitEntry>> = {};
  for (const entry of entries) {
    if (!grouped[entry.habitId]) {
      grouped[entry.habitId] = {};
    }
    const habitGroup = grouped[entry.habitId];
    if (habitGroup) {
      habitGroup[entry.date] = {
        id: entry.id,
        personId: entry.personId,
        habitId: entry.habitId,
        date: entry.date,
        status: entry.status as DayStatus,
        amountSpent: entry.amountSpent,
        availableBalance: entry.availableBalance,
      };
    }
  }

  return grouped;
}

// Calculate available balance for a budget habit on a given date
async function calculateAvailableBalance(
  personId: string,
  habitId: string,
  date: string,
  habit: Habit,
): Promise<number> {
  const settings = habit.settings as BudgetHabitSettings;
  const currentDate = parseISO(date);

  // Check if this is a weekend day with bonus
  const dayOfWeek = getDay(currentDate); // 0 = Sunday, 6 = Saturday
  const weekStart = format(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );

  let dailyLimit = settings.dailyLimit;

  // Check if this weekend day was chosen for bonus
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const [choice] = await db
      .select()
      .from(weekendChoices)
      .where(
        and(
          eq(weekendChoices.personId, personId),
          eq(weekendChoices.habitId, habitId),
          eq(weekendChoices.weekStart, weekStart),
        ),
      )
      .limit(1);

    if (choice) {
      const chosenDay = choice.chosenDay === "saturday" ? 6 : 0;
      if (dayOfWeek === chosenDay) {
        dailyLimit = settings.weekendLimit;
      }
    }
  }

  // Get previous day's balance
  const previousDate = format(subDays(currentDate, 1), "yyyy-MM-dd");
  const [prevEntry] = await db
    .select()
    .from(habitEntries)
    .where(
      and(
        eq(habitEntries.personId, personId),
        eq(habitEntries.habitId, habitId),
        eq(habitEntries.date, previousDate),
      ),
    )
    .limit(1);

  let carryOver = 0;
  if (prevEntry && prevEntry.availableBalance) {
    carryOver = Math.max(0, parseFloat(prevEntry.availableBalance));

    // Apply weekly burn if this is Monday (day 1)
    const currentDayOfWeek = getDay(currentDate);
    if (currentDayOfWeek === 1) {
      const burnMultiplier = 1 - settings.burnPercentage / 100;
      carryOver = carryOver * burnMultiplier;
    }
  }

  return dailyLimit + carryOver;
}

// Update or create habit entry
export async function updateHabitEntry(
  personId: string,
  habitId: string,
  date: string,
  status: DayStatus,
  amountSpent?: number,
): Promise<void> {
  // Get habit info
  const [habit] = await db
    .select()
    .from(habits)
    .where(eq(habits.id, habitId))
    .limit(1);

  if (!habit) {
    throw new Error("Habit not found");
  }

  let availableBalance: number | undefined;
  let finalStatus = status;

  // For budget habits, calculate balance and determine status
  if (habit.type === "budget" && amountSpent !== undefined) {
    const balance = await calculateAvailableBalance(personId, habitId, date, {
      id: habit.id,
      name: habit.name,
      type: habit.type as HabitType,
      settings: habit.settings as BudgetHabitSettings,
      order: habit.order,
    });

    availableBalance = balance - amountSpent;
    finalStatus = availableBalance >= 0 ? "green" : "red";
  }

  // Check if entry exists
  const [existing] = await db
    .select()
    .from(habitEntries)
    .where(
      and(
        eq(habitEntries.personId, personId),
        eq(habitEntries.habitId, habitId),
        eq(habitEntries.date, date),
      ),
    )
    .limit(1);

  if (existing) {
    // Update existing entry
    await db
      .update(habitEntries)
      .set({
        status: finalStatus,
        amountSpent: amountSpent?.toString(),
        availableBalance: availableBalance?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(habitEntries.id, existing.id));
  } else {
    // Insert new entry
    await db.insert(habitEntries).values({
      personId,
      habitId,
      date,
      status: finalStatus,
      amountSpent: amountSpent?.toString(),
      availableBalance: availableBalance?.toString(),
    });
  }

  revalidatePath("/");
}

// Get weekend choice for a person/habit/week
export async function getWeekendChoice(
  personId: string,
  habitId: string,
  date: string,
): Promise<WeekendChoice | undefined> {
  const currentDate = parseISO(date);
  const weekStart = format(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );

  const [choice] = await db
    .select()
    .from(weekendChoices)
    .where(
      and(
        eq(weekendChoices.personId, personId),
        eq(weekendChoices.habitId, habitId),
        eq(weekendChoices.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (!choice) return undefined;

  return {
    id: choice.id,
    personId: choice.personId,
    habitId: choice.habitId,
    weekStart: choice.weekStart,
    chosenDay: choice.chosenDay,
  };
}

// Set weekend choice
export async function setWeekendChoice(
  personId: string,
  habitId: string,
  date: string,
  chosenDay: "saturday" | "sunday",
): Promise<void> {
  const currentDate = parseISO(date);
  const weekStart = format(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );

  // Check if choice exists
  const [existing] = await db
    .select()
    .from(weekendChoices)
    .where(
      and(
        eq(weekendChoices.personId, personId),
        eq(weekendChoices.habitId, habitId),
        eq(weekendChoices.weekStart, weekStart),
      ),
    )
    .limit(1);

  if (existing) {
    // Update existing choice
    await db
      .update(weekendChoices)
      .set({ chosenDay })
      .where(eq(weekendChoices.id, existing.id));
  } else {
    // Insert new choice
    await db.insert(weekendChoices).values({
      personId,
      habitId,
      weekStart,
      chosenDay,
    });
  }

  revalidatePath("/");
}

// Update person name
export async function updatePersonName(
  personId: string,
  name: string,
): Promise<void> {
  await db
    .update(persons)
    .set({ name, updatedAt: new Date() })
    .where(eq(persons.id, personId));

  revalidatePath("/");
}

// Update habit settings
export async function updateHabitSettings(
  habitId: string,
  settings: BudgetHabitSettings,
): Promise<void> {
  await db
    .update(habits)
    .set({ settings, updatedAt: new Date() })
    .where(eq(habits.id, habitId));

  revalidatePath("/");
}

// Set person preference cookie
export async function setPersonCookie(personId: string): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  cookieStore.set("id", personId, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
  });

  revalidatePath("/");
}
