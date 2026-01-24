"use client";

import type { Habit, HabitEntry } from "~/app/actions";
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
import {
  ModalTrigger,
  ModalOverlay,
  ModalContent,
  ModalDialog,
} from "./atoms/modal";
import { CalendarDay } from "./calendar-day";
import { HabitSettingsModal } from "./habit-settings-modal";
import { MonthStats } from "./month-stats";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarProps {
  personId: string;
  habit: Habit;
  currentMonth: Date;
  entries: Record<string, HabitEntry>;
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
  personId,
  habit,
  currentMonth,
  entries,
  onMonthChange,
}: CalendarProps): ReactElement {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = (): void => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (): void => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr,auto]">
        {/* Calendar */}
        <div className="w-full rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Habit header with settings */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {habit.name}
            </h3>
            <ModalTrigger>
              <Button variant="secondary" size="sm">
                ⚙️
              </Button>
              <ModalOverlay>
                <ModalContent>
                  <ModalDialog>
                    {({ close }) => (
                      <HabitSettingsModal habit={habit} close={close} />
                    )}
                  </ModalDialog>
                </ModalContent>
              </ModalOverlay>
            </ModalTrigger>
          </div>

          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Button variant="secondary" size="sm" onPress={handlePrevMonth}>
              ←
            </Button>
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {format(currentMonth, "MMMM yyyy")}
            </h4>
            <Button variant="secondary" size="sm" onPress={handleNextMonth}>
              →
            </Button>
          </div>

          {/* Days of Week Header */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dateKey = getDateKey(day);
              const entry = entries[dateKey];
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isEditable = isDayEditable(day);
              const isToday = isTodayDate(day);

              return (
                <CalendarDay
                  key={dateKey}
                  personId={personId}
                  habit={habit}
                  date={day}
                  dayNumber={day.getDate()}
                  entry={entry}
                  isCurrentMonth={isCurrentMonthDay}
                  isEditable={isEditable}
                  isToday={isToday}
                />
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <MonthStats currentMonth={currentMonth} entries={entries} />
      </div>
    </div>
  );
}
