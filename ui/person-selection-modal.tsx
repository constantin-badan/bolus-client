"use client";

import type { Person } from "~/app/actions";
import { ReactElement } from "react";
import { Button } from "./atoms/button";
import { ModalHeader, ModalTitle, ModalBody } from "./atoms/modal";

interface PersonSelectionModalProps {
  persons: Person[];
  onSelect: (personId: string) => void;
}

export function PersonSelectionModal({
  persons,
  onSelect,
}: PersonSelectionModalProps): ReactElement {
  return (
    <>
      <ModalHeader>
        <ModalTitle>Who are you?</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Select your name to personalize your experience
        </p>
        <div className="flex flex-col gap-3">
          {persons.map((person) => (
            <Button
              key={person.id}
              variant="primary"
              size="lg"
              onPress={() => {
                onSelect(person.id);
              }}
            >
              {person.name}
            </Button>
          ))}
        </div>
      </ModalBody>
    </>
  );
}
