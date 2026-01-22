import clsx from "clsx";
import { ReactElement } from "react";
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

type DayStatus = "green" | "red" | "neutral" | "skipped";

interface CalendarDayProps {
  date: Date;
  dayNumber: number;
  status: DayStatus;
  isCurrentMonth: boolean;
  isEditable: boolean;
  isToday: boolean;
  onStatusChange?: (date: Date, status: DayStatus) => void;
}

interface DayModalContentProps {
  date: Date;
  dayNumber: number;
  onStatusChange: ((date: Date, status: DayStatus) => void) | undefined;
  close: () => void;
}

function DayModalContent({
  date,
  dayNumber,
  onStatusChange,
  close,
}: DayModalContentProps): ReactElement {
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
                onStatusChange?.(date, "green");
                close();
              }}
            >
              ✓ Achieved
            </Button>
            <Button
              variant="danger"
              size="lg"
              onPress={() => {
                onStatusChange?.(date, "red");
                close();
              }}
            >
              ✗ Failed
            </Button>
          </div>
          <Button
            variant="warning"
            size="lg"
            onPress={() => {
              onStatusChange?.(date, "skipped");
              close();
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
  green:
    "bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/30",
  red: "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg hover:shadow-red-500/30",
  neutral:
    "bg-white text-zinc-700 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm hover:shadow dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:border-zinc-600",
  skipped:
    "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300 hover:from-amber-200 hover:to-amber-300 shadow-sm hover:shadow dark:from-amber-900/30 dark:to-amber-900/40 dark:text-amber-300 dark:border-amber-800 dark:hover:from-amber-900/40 dark:hover:to-amber-900/50",
};

export function CalendarDay({
  date,
  dayNumber,
  status,
  isCurrentMonth,
  isEditable,
  isToday,
  onStatusChange,
}: CalendarDayProps): ReactElement {
  const baseStyles =
    "h-14 w-full rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center";

  // Today gets a special border
  const todayBorder = isToday
    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black"
    : "";

  // Different styles for editable vs non-editable days
  let dayStyles = "";
  if (!isCurrentMonth) {
    // Days from other months
    dayStyles = "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600";
  } else if (isEditable) {
    // Editable days (today and past week)
    dayStyles = statusStyles[status];
  } else {
    // Future days and past days beyond 1 week - make them more muted
    dayStyles =
      "bg-zinc-100/50 text-zinc-400 border border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-600 dark:border-zinc-800";
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
        {dayNumber}
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
          "hover:scale-105 active:scale-95 cursor-pointer",
        )}
      >
        {dayNumber}
      </RACButton>
      <ModalOverlay>
        <ModalContent>
          <ModalDialog>
            {({ close }) => (
              <DayModalContent
                date={date}
                dayNumber={dayNumber}
                onStatusChange={onStatusChange}
                close={close}
              />
            )}
          </ModalDialog>
        </ModalContent>
      </ModalOverlay>
    </ModalTrigger>
  );
}
