"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { MonthStats } from "../ui/month-stats";

type DayStatus = "green" | "red" | "neutral" | "skipped";
type HabitsData = Record<string, DayStatus>;

export default function Home(): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [habitsData, setHabitsData] = useState<HabitsData>({});

  const handleStatusChange = (date: Date, status: DayStatus): void => {
    const dateKey = format(date, "yyyy-MM-dd");
    setHabitsData((prev) => ({
      ...prev,
      [dateKey]: status,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Habit Tracker
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <Calendar
            currentMonth={currentMonth}
            habitsData={habitsData}
            onStatusChange={handleStatusChange}
            onMonthChange={setCurrentMonth}
          />
          <MonthStats currentMonth={currentMonth} habitsData={habitsData} />
        </div>
      </main>
    </div>
  );
}
