"use client";

import type { Habit, BudgetHabitSettings } from "~/app/actions";
import { useState, useTransition } from "react";
import { ReactElement } from "react";
import { Button } from "./atoms/button";
import { ModalHeader, ModalTitle, ModalClose, ModalBody } from "./atoms/modal";
import { updateHabitSettings } from "~/app/actions";

interface HabitSettingsModalProps {
  habit: Habit;
  close: () => void;
}

export function HabitSettingsModal({
  habit,
  close,
}: HabitSettingsModalProps): ReactElement {
  const settings = habit.settings as BudgetHabitSettings;
  const [dailyLimit, setDailyLimit] = useState(settings.dailyLimit || 35);
  const [weekendLimit, setWeekendLimit] = useState(
    settings.weekendLimit || 100,
  );
  const [burnPercentage, setBurnPercentage] = useState(
    settings.burnPercentage || 50,
  );
  const [, startTransition] = useTransition();

  const handleSave = (): void => {
    startTransition(async () => {
      await updateHabitSettings(habit.id, {
        dailyLimit,
        weekendLimit,
        burnPercentage,
      });
      close();
    });
  };

  return (
    <>
      <ModalHeader>
        <ModalTitle>{habit.name} Settings</ModalTitle>
        <ModalClose onPress={close} />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="daily-limit"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Daily Limit (MDL)
            </label>
            <input
              id="daily-limit"
              type="number"
              value={dailyLimit}
              onChange={(e) => {
                setDailyLimit(Number(e.target.value));
              }}
              min={0}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              The default daily budget limit
            </p>
          </div>

          <div>
            <label
              htmlFor="weekend-limit"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Weekend Bonus Limit (MDL)
            </label>
            <input
              id="weekend-limit"
              type="number"
              value={weekendLimit}
              onChange={(e) => {
                setWeekendLimit(Number(e.target.value));
              }}
              min={0}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Limit for one chosen weekend day (Sat or Sun)
            </p>
          </div>

          <div>
            <label
              htmlFor="burn-percentage"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Weekly Burn Percentage (%)
            </label>
            <input
              id="burn-percentage"
              type="number"
              value={burnPercentage}
              onChange={(e) => {
                setBurnPercentage(Number(e.target.value));
              }}
              min={0}
              max={100}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Percentage of unused budget burned each Monday
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onPress={close}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
}
