"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  isToday as isTodayDate,
  addMonths,
  subMonths,
  startOfDay,
} from "date-fns";
import { ReactElement } from "react";
import { Button } from "./atoms/button";
import { CalendarDay } from "./calendar-day";

type DayStatus = "green" | "red" | "neutral" | "skipped";
type HabitsData = Record<string, DayStatus>;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarProps {
  currentMonth: Date;
  habitsData: HabitsData;
  onStatusChange: (date: Date, status: DayStatus) => void;
  onMonthChange: (date: Date) => void;
}

function getDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function isDayEditable(date: Date): boolean {
  const today = startOfDay(new Date());
  const dayToCheck = startOfDay(date);
  // Can edit today and past days
  return !isBefore(today, dayToCheck);
}

export function Calendar({
  currentMonth,
  habitsData,
  onStatusChange,
  onMonthChange,
}: CalendarProps): ReactElement {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = (): void => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (): void => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="secondary" onPress={handlePrevMonth}>
          ← Previous
        </Button>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="secondary" onPress={handleNextMonth}>
          Next →
        </Button>
      </div>

      {/* Days of Week Header */}
      <div className="mb-3 grid grid-cols-7 gap-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dateKey = getDateKey(day);
          const status = habitsData[dateKey] || "neutral";
          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const isEditable = isDayEditable(day);
          const isToday = isTodayDate(day);

          return (
            <CalendarDay
              key={dateKey}
              date={day}
              dayNumber={day.getDate()}
              status={status}
              isCurrentMonth={isCurrentMonthDay}
              isEditable={isEditable}
              isToday={isToday}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    </div>
  );
}
