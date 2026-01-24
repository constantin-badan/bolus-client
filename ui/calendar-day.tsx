import type {
  Habit,
  HabitEntry,
  DayStatus,
  BudgetHabitSettings,
} from "~/app/actions";
import clsx from "clsx";
import { format, getDay } from "date-fns";
import { ReactElement, useState, useTransition, useEffect } from "react";
import { Button as RACButton } from "react-aria-components";
import { Button } from "./atoms/button";
import {
  ModalTrigger,
  ModalOverlay,
  ModalContent,
  ModalDialog,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
} from "./atoms/modal";
import {
  updateHabitEntry,
  setWeekendChoice,
  getWeekendChoice,
} from "~/app/actions";

interface CalendarDayProps {
  personId: string;
  habit: Habit;
  date: Date;
  dayNumber: number;
  entry: HabitEntry | undefined;
  isCurrentMonth: boolean;
  isEditable: boolean;
  isToday: boolean;
}

interface DayModalContentProps {
  personId: string;
  habit: Habit;
  date: Date;
  dayNumber: number;
  entry: HabitEntry | undefined;
  close: () => void;
}

function BudgetDayModal({
  personId,
  habit,
  date,
  entry,
  close,
}: Omit<DayModalContentProps, "dayNumber">): ReactElement {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const settings = habit.settings as BudgetHabitSettings;

  const [amountSpent, setAmountSpent] = useState(() =>
    entry?.amountSpent ? parseFloat(entry.amountSpent) : 0,
  );
  const [weekendChoice, setWeekendChoiceState] = useState<
    "saturday" | "sunday" | undefined
  >(undefined);
  const [, startTransition] = useTransition();

  // Load weekend choice if this is a weekend day
  useEffect(() => {
    if (isWeekend) {
      startTransition(async () => {
        const choice = await getWeekendChoice(personId, habit.id, dateStr);
        setWeekendChoiceState(choice?.chosenDay);
      });
    }
  }, [isWeekend, personId, habit.id, dateStr]);

  const handleSave = (): void => {
    startTransition(async () => {
      await updateHabitEntry(
        personId,
        habit.id,
        dateStr,
        "neutral",
        amountSpent,
      );
      close();
    });
  };

  const handleSkip = (): void => {
    startTransition(async () => {
      await updateHabitEntry(personId, habit.id, dateStr, "skipped");
      close();
    });
  };

  const handleWeekendChoice = (day: "saturday" | "sunday"): void => {
    startTransition(async () => {
      await setWeekendChoice(personId, habit.id, dateStr, day);
      setWeekendChoiceState(day);
    });
  };

  const availableBalance = entry?.availableBalance
    ? parseFloat(entry.availableBalance)
    : settings.dailyLimit;

  const dayLimit =
    isWeekend && weekendChoice === (dayOfWeek === 6 ? "saturday" : "sunday")
      ? settings.weekendLimit
      : settings.dailyLimit;

  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {format(date, "EEEE, MMM d")} - {habit.name}
        </ModalTitle>
        <ModalClose onPress={close} />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {/* Weekend choice (if weekend) */}
          {isWeekend && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-2 text-sm font-medium text-amber-900 dark:text-amber-100">
                Weekend Bonus Day ({settings.weekendLimit} MDL)
              </p>
              <div className="flex gap-2">
                <Button
                  variant={
                    weekendChoice === "saturday" ? "primary" : "secondary"
                  }
                  size="sm"
                  onPress={() => {
                    handleWeekendChoice("saturday");
                  }}
                >
                  Saturday
                </Button>
                <Button
                  variant={weekendChoice === "sunday" ? "primary" : "secondary"}
                  size="sm"
                  onPress={() => {
                    handleWeekendChoice("sunday");
                  }}
                >
                  Sunday
                </Button>
              </div>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Choose one weekend day for {settings.weekendLimit} MDL limit
              </p>
            </div>
          )}

          {/* Balance display */}
          <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Daily Limit
            </p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {dayLimit} MDL
            </p>
            {entry && (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Available: {availableBalance.toFixed(2)} MDL
              </p>
            )}
          </div>

          {/* Amount input */}
          <div>
            <label
              htmlFor="amount-spent"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Amount Spent (MDL)
            </label>
            <input
              id="amount-spent"
              type="number"
              value={amountSpent}
              onChange={(e) => {
                setAmountSpent(Number(e.target.value));
              }}
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Result preview */}
          {amountSpent > 0 && (
            <div
              className={clsx(
                "rounded-lg p-3",
                availableBalance - amountSpent >= 0
                  ? "bg-green-50 dark:bg-green-950"
                  : "bg-red-50 dark:bg-red-950",
              )}
            >
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Remaining Balance
              </p>
              <p
                className={clsx(
                  "text-lg font-bold",
                  availableBalance - amountSpent >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {(availableBalance - amountSpent).toFixed(2)} MDL
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleSave}>
                Save
              </Button>
            </div>
            <Button variant="warning" onPress={handleSkip}>
              Skip Day
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
}

function BooleanDayModal({
  personId,
  habit,
  date,
  dayNumber,
  close,
}: DayModalContentProps): ReactElement {
  const dateStr = format(date, "yyyy-MM-dd");
  const [, startTransition] = useTransition();

  const handleStatusChange = (status: DayStatus): void => {
    startTransition(async () => {
      await updateHabitEntry(personId, habit.id, dateStr, status);
      close();
    });
  };

  return (
    <>
      <ModalHeader>
        <ModalTitle>Day {dayNumber}</ModalTitle>
        <ModalClose onPress={close} />
      </ModalHeader>
      <ModalBody>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Mark this day's status
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="success"
              size="lg"
              onPress={() => {
                handleStatusChange("green");
              }}
            >
              ✓ Achieved
            </Button>
            <Button
              variant="danger"
              size="lg"
              onPress={() => {
                handleStatusChange("red");
              }}
            >
              ✗ Failed
            </Button>
          </div>
          <Button
            variant="warning"
            size="lg"
            onPress={() => {
              handleStatusChange("skipped");
            }}
          >
            − Skip Day
          </Button>
        </div>
      </ModalBody>
    </>
  );
}

const statusStyles: Record<DayStatus, string> = {
  green: clsx(
    "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/30",
  ),
  red: clsx(
    "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30",
  ),
  neutral: clsx(
    "border-2 border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-700",
  ),
  skipped: clsx(
    "border border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 shadow-sm hover:from-amber-200 hover:to-amber-300 hover:shadow dark:border-amber-800 dark:from-amber-900/30 dark:to-amber-900/40 dark:text-amber-300 dark:hover:from-amber-900/40 dark:hover:to-amber-900/50",
  ),
};

export function CalendarDay({
  personId,
  habit,
  date,
  dayNumber,
  entry,
  isCurrentMonth,
  isEditable,
  isToday,
}: CalendarDayProps): ReactElement {
  const status = entry?.status || "neutral";

  const baseStyles = clsx(
    "flex h-12 w-full flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200",
  );

  // Today gets a special border
  const todayBorder = clsx({
    "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black": isToday,
  });

  // Different styles for editable vs non-editable days
  let dayStyles = "";
  if (!isCurrentMonth) {
    // Days from other months
    dayStyles = clsx(
      "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
    );
  } else if (isEditable) {
    // Editable days (today and past)
    dayStyles = statusStyles[status];
  } else {
    // Future days
    dayStyles = clsx(
      "border border-zinc-200 bg-zinc-100/50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-600",
    );
  }

  if (!isEditable || !isCurrentMonth) {
    return (
      <div
        className={clsx(
          baseStyles,
          dayStyles,
          todayBorder,
          "cursor-not-allowed opacity-60",
        )}
      >
        <span>{dayNumber}</span>
        {habit.type === "budget" && entry?.amountSpent && (
          <span className="text-xs">
            {parseFloat(entry.amountSpent).toFixed(0)}
          </span>
        )}
      </div>
    );
  }

  return (
    <ModalTrigger>
      <RACButton
        className={clsx(
          baseStyles,
          dayStyles,
          todayBorder,
          "cursor-pointer hover:scale-105 active:scale-95",
        )}
      >
        <span>{dayNumber}</span>
        {habit.type === "budget" && entry?.amountSpent && (
          <span className="text-xs opacity-90">
            {parseFloat(entry.amountSpent).toFixed(0)}
          </span>
        )}
      </RACButton>
      <ModalOverlay>
        <ModalContent>
          <ModalDialog>
            {({ close }) =>
              habit.type === "budget" ? (
                <BudgetDayModal
                  personId={personId}
                  habit={habit}
                  date={date}
                  entry={entry}
                  close={close}
                />
              ) : (
                <BooleanDayModal
                  personId={personId}
                  habit={habit}
                  date={date}
                  dayNumber={dayNumber}
                  entry={entry}
                  close={close}
                />
              )
            }
          </ModalDialog>
        </ModalContent>
      </ModalOverlay>
    </ModalTrigger>
  );
}
