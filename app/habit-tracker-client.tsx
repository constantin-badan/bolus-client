"use client";

import type { DayStatus } from "./actions";
import { format } from "date-fns";
import { useState, useTransition } from "react";
import { Calendar } from "../ui/calendar";
import { MonthStats } from "../ui/month-stats";
import { updateHabitEntry } from "./actions";

type HabitsData = Record<string, DayStatus>;

interface HabitTrackerClientProps {
  initialData: HabitsData;
}

export function HabitTrackerClient({
  initialData,
}: HabitTrackerClientProps): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [habitsData, setHabitsData] = useState<HabitsData>(initialData);
  const [, startTransition] = useTransition();

  const handleStatusChange = (date: Date, status: DayStatus): void => {
    const dateKey = format(date, "yyyy-MM-dd");

    // Optimistically update the UI
    setHabitsData((prev) => ({
      ...prev,
      [dateKey]: status,
    }));

    // Persist to database
    startTransition(async () => {
      await updateHabitEntry(dateKey, status);
    });
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <Calendar
        currentMonth={currentMonth}
        habitsData={habitsData}
        onStatusChange={handleStatusChange}
        onMonthChange={setCurrentMonth}
      />
      <MonthStats currentMonth={currentMonth} habitsData={habitsData} />
    </div>
  );
}
