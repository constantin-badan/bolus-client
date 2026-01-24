import { cookies } from "next/headers";
import { getPersons, getHabits, getHabitEntriesForPerson } from "./actions";
import { HabitTrackerClient } from "./habit-tracker-client";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.JSX.Element> {
  const [persons, habits] = await Promise.all([getPersons(), getHabits()]);

  // Load data for all persons
  const personsData = await Promise.all(
    persons.map(async (person) => ({
      person,
      entries: await getHabitEntriesForPerson(person.id),
    })),
  );

  // Read person cookie and reorder data
  const cookieStore = await cookies();
  const personCookie = cookieStore.get("id");
  const currentPersonId = personCookie?.value;

  let orderedPersonsData = personsData;
  if (currentPersonId) {
    const currentPersonData = personsData.find(
      (pd) => pd.person.id === currentPersonId,
    );
    const otherPersonsData = personsData.filter(
      (pd) => pd.person.id !== currentPersonId,
    );
    if (currentPersonData) {
      orderedPersonsData = [currentPersonData, ...otherPersonsData];
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <HabitTrackerClient
          persons={persons}
          habits={habits}
          initialData={orderedPersonsData}
          currentPersonId={currentPersonId}
        />
      </main>
    </div>
  );
}
