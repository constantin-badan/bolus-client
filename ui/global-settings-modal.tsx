"use client";

import type { Person } from "~/app/actions";
import { useState, useTransition } from "react";
import { ReactElement } from "react";
import { Button } from "./atoms/button";
import { ModalHeader, ModalTitle, ModalClose, ModalBody } from "./atoms/modal";
import { updatePersonName } from "~/app/actions";

interface GlobalSettingsModalProps {
  persons: Person[];
  close: () => void;
}

export function GlobalSettingsModal({
  persons,
  close,
}: GlobalSettingsModalProps): ReactElement {
  const [names, setNames] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    for (const person of persons) {
      result[person.id] = person.name;
    }
    return result;
  });
  const [, startTransition] = useTransition();

  const handleSave = (): void => {
    startTransition(async () => {
      const updates = persons
        .filter((person) => names[person.id] !== person.name)
        .map(async (person) => {
          await updatePersonName(person.id, names[person.id] ?? person.name);
        });

      await Promise.all(updates);
      close();
    });
  };

  return (
    <>
      <ModalHeader>
        <ModalTitle>Global Settings</ModalTitle>
        <ModalClose onPress={close} />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Person Names
            </h3>
            <div className="space-y-3">
              {persons.map((person, idx) => (
                <div key={person.id}>
                  <label
                    htmlFor={`person-${person.id}`}
                    className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Person {idx + 1}
                  </label>
                  <input
                    id={`person-${person.id}`}
                    type="text"
                    value={names[person.id] || ""}
                    onChange={(e) => {
                      setNames((prev) => ({
                        ...prev,
                        [person.id]: e.target.value,
                      }));
                    }}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onPress={close}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
}
