"use client";

import type { Person, Habit, HabitEntry } from "./actions";
import { useState, useTransition } from "react";
import { Button } from "../ui/atoms/button";
import {
  ModalTrigger,
  ModalOverlay,
  ModalContent,
  ModalDialog,
} from "../ui/atoms/modal";
import { Calendar } from "../ui/calendar";
import { GlobalSettingsModal } from "../ui/global-settings-modal";
import { PersonSelectionModal } from "../ui/person-selection-modal";
import { setPersonCookie } from "./actions";

interface PersonData {
  person: Person;
  entries: Record<string, Record<string, HabitEntry>>;
}

interface HabitTrackerClientProps {
  persons: Person[];
  habits: Habit[];
  initialData: PersonData[];
  currentPersonId: string | undefined;
}

const EMPTY_ENTRIES: Record<string, HabitEntry> = {};

export function HabitTrackerClient({
  persons,
  habits,
  initialData,
  currentPersonId,
}: HabitTrackerClientProps): React.JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [showPersonSelection, setShowPersonSelection] =
    useState(!currentPersonId);
  const [, startTransition] = useTransition();

  const handlePersonSelect = (personId: string): void => {
    setShowPersonSelection(false);
    startTransition(async () => {
      await setPersonCookie(personId);
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with global settings */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Habit Tracker
          </h1>
          <ModalTrigger>
            <Button variant="secondary">⚙️ Settings</Button>
            <ModalOverlay>
              <ModalContent>
                <ModalDialog>
                  {({ close }) => (
                    <GlobalSettingsModal persons={persons} close={close} />
                  )}
                </ModalDialog>
              </ModalContent>
            </ModalOverlay>
          </ModalTrigger>
        </div>

        {/* Side-by-side calendars for each person */}
        <div className="grid gap-8 lg:grid-cols-2">
          {initialData.map(({ person, entries }) => (
            <div key={person.id} className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {person.name}
              </h2>
              {habits.map((habit) => (
                <Calendar
                  key={habit.id}
                  personId={person.id}
                  habit={habit}
                  currentMonth={currentMonth}
                  entries={entries[habit.id] ?? EMPTY_ENTRIES}
                  onMonthChange={setCurrentMonth}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Person selection modal (shown on first visit) */}
      <ModalOverlay
        isOpen={showPersonSelection}
        onOpenChange={setShowPersonSelection}
        isDismissable={false}
      >
        <ModalContent>
          <ModalDialog>
            <PersonSelectionModal
              persons={persons}
              onSelect={handlePersonSelect}
            />
          </ModalDialog>
        </ModalContent>
      </ModalOverlay>
    </>
  );
}
