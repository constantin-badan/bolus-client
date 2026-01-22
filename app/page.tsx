import { getHabitEntries } from "./actions";
import { HabitTrackerClient } from "./habit-tracker-client";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.JSX.Element> {
  const initialData = await getHabitEntries();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Habit Tracker
        </h1>
        <HabitTrackerClient initialData={initialData} />
      </main>
    </div>
  );
}
