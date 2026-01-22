"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { habitEntries } from "~/db/schema";

export type DayStatus = "green" | "red" | "neutral" | "skipped";

export async function getHabitEntries(): Promise<Record<string, DayStatus>> {
  const entries = await db.select().from(habitEntries);

  // Convert to the format expected by the UI
  const habitsData: Record<string, DayStatus> = {};
  for (const entry of entries) {
    const status: DayStatus = entry.status;
    habitsData[entry.date] = status;
  }

  return habitsData;
}

export async function updateHabitEntry(
  date: string,
  status: DayStatus,
): Promise<void> {
  // Check if entry exists
  const existing = await db
    .select()
    .from(habitEntries)
    .where(eq(habitEntries.date, date))
    .limit(1);

  if (existing.length > 0) {
    // Update existing entry
    await db
      .update(habitEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(habitEntries.date, date));
  } else {
    // Insert new entry
    await db.insert(habitEntries).values({ date, status });
  }

  revalidatePath("/");
}
