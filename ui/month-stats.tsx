import type { HabitEntry } from "~/app/actions";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isBefore,
  startOfDay,
} from "date-fns";
import { ReactElement } from "react";

interface MonthStatsProps {
  currentMonth: Date;
  entries: Record<string, HabitEntry>;
}

function getDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function MonthStats({
  currentMonth,
  entries,
}: MonthStatsProps): ReactElement {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const today = startOfDay(new Date());

  // Get all days in the month up to today (don't count future days or skipped days)
  const allMonthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const pastDays = allMonthDays.filter(
    (day) => !isBefore(today, startOfDay(day)),
  );

  // Exclude skipped days from stats
  const eligibleDays = pastDays.filter((day) => {
    const dateKey = getDateKey(day);
    const entry = entries[dateKey];
    return entry?.status !== "skipped";
  });

  const greenDays = eligibleDays.filter((day) => {
    const dateKey = getDateKey(day);
    const entry = entries[dateKey];
    return entry?.status === "green";
  }).length;

  const redDays = eligibleDays.filter((day) => {
    const dateKey = getDateKey(day);
    const entry = entries[dateKey];
    return entry?.status === "red";
  }).length;

  const skippedDays = pastDays.filter((day) => {
    const dateKey = getDateKey(day);
    const entry = entries[dateKey];
    return entry?.status === "skipped";
  }).length;

  const totalDays = eligibleDays.length;
  const percentage =
    totalDays > 0 ? Math.round((greenDays / totalDays) * 100) : 0;

  return (
    <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {format(currentMonth, "MMMM yyyy")} Stats
      </h3>

      <div className="space-y-4">
        {/* Success Rate */}
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Success Rate
          </p>
          <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
            {percentage}%
          </p>
        </div>

        {/* Days Achieved */}
        <div className="flex items-center justify-between rounded-md bg-zinc-50 p-4 dark:bg-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Days Achieved
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {greenDays}/{totalDays}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <span className="text-xl text-white">✓</span>
          </div>
        </div>

        {/* Days Failed */}
        <div className="flex items-center justify-between rounded-md bg-zinc-50 p-4 dark:bg-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Days Failed
            </p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {redDays}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
            <span className="text-xl text-white">✗</span>
          </div>
        </div>

        {/* Skipped Days */}
        {skippedDays > 0 && (
          <div className="flex items-center justify-between rounded-md bg-zinc-50 p-4 dark:bg-zinc-800">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Days Skipped
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {skippedDays}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500">
              <span className="text-xl text-white">−</span>
            </div>
          </div>
        )}

        {/* Current Streak - Placeholder for future */}
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Current Streak
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
