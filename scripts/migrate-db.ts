import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function migrate() {
  console.log("Starting migration...");

  try {
    // Step 1: Rename old habit_entries table if it exists
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'habit_entries'
        ) THEN
          ALTER TABLE habit_entries RENAME TO habit_entries_old;
        END IF;
      END $$;
    `);
    console.log("✓ Renamed old habit_entries table");

    // Step 2: Create new tables
    console.log("Creating new tables...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "persons" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✓ Created persons table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "habits" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
        "order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✓ Created habits table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "habit_entries" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "person_id" uuid NOT NULL,
        "habit_id" uuid NOT NULL,
        "date" date NOT NULL,
        "status" text DEFAULT 'neutral' NOT NULL,
        "amount_spent" numeric(10, 2),
        "available_balance" numeric(10, 2),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "habit_entries_person_id_habit_id_date_unique" UNIQUE("person_id","habit_id","date")
      );
    `);
    console.log("✓ Created habit_entries table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "weekend_choices" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "person_id" uuid NOT NULL,
        "habit_id" uuid NOT NULL,
        "week_start" date NOT NULL,
        "chosen_day" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "weekend_choices_person_id_habit_id_week_start_unique" UNIQUE("person_id","habit_id","week_start")
      );
    `);
    console.log("✓ Created weekend_choices table");

    // Step 3: Add foreign keys
    await db.execute(sql`
      ALTER TABLE "habit_entries"
      ADD CONSTRAINT "habit_entries_person_id_persons_id_fk"
      FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id")
      ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(sql`
      ALTER TABLE "habit_entries"
      ADD CONSTRAINT "habit_entries_habit_id_habits_id_fk"
      FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id")
      ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(sql`
      ALTER TABLE "weekend_choices"
      ADD CONSTRAINT "weekend_choices_person_id_persons_id_fk"
      FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id")
      ON DELETE cascade ON UPDATE no action;
    `);

    await db.execute(sql`
      ALTER TABLE "weekend_choices"
      ADD CONSTRAINT "weekend_choices_habit_id_habits_id_fk"
      FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id")
      ON DELETE cascade ON UPDATE no action;
    `);
    console.log("✓ Added foreign key constraints");

    // Step 4: Create default persons and habit
    const person1Result = await db.execute(sql`
      INSERT INTO persons (name)
      VALUES ('Person 1')
      RETURNING id;
    `);
    const person1 = person1Result[0];
    if (!person1) throw new Error("Failed to create Person 1");
    const person1Id = person1.id as string;
    console.log(`✓ Created Person 1: ${person1Id}`);

    const person2Result = await db.execute(sql`
      INSERT INTO persons (name)
      VALUES ('Person 2')
      RETURNING id;
    `);
    const person2 = person2Result[0];
    if (!person2) throw new Error("Failed to create Person 2");
    const person2Id = person2.id as string;
    console.log(`✓ Created Person 2: ${person2Id}`);

    const habitResult = await db.execute(sql`
      INSERT INTO habits (name, type, settings, "order")
      VALUES (
        'Sweet Treats Budget',
        'budget',
        '{"dailyLimit": 35, "weekendLimit": 100, "burnPercentage": 50}'::jsonb,
        0
      )
      RETURNING id;
    `);
    const habit = habitResult[0];
    if (!habit) throw new Error("Failed to create habit");
    const habitId = habit.id as string;
    console.log(`✓ Created Sweet Treats Budget habit: ${habitId}`);

    // Step 5: Migrate old data if exists
    const oldDataExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'habit_entries_old'
      ) as exists;
    `);

    if (oldDataExists[0]?.exists) {
      console.log("Migrating old data...");
      // Migrate to both persons (they had the same data before)
      await db.execute(sql`
        INSERT INTO habit_entries (person_id, habit_id, date, status, created_at, updated_at)
        SELECT
          ${sql.raw(`'${person1Id}'::uuid`)},
          ${sql.raw(`'${habitId}'::uuid`)},
          date,
          status,
          created_at,
          updated_at
        FROM habit_entries_old;
      `);

      await db.execute(sql`
        INSERT INTO habit_entries (person_id, habit_id, date, status, created_at, updated_at)
        SELECT
          ${sql.raw(`'${person2Id}'::uuid`)},
          ${sql.raw(`'${habitId}'::uuid`)},
          date,
          status,
          created_at,
          updated_at
        FROM habit_entries_old;
      `);

      console.log("✓ Migrated old habit entries");

      // Drop old table
      await db.execute(sql`DROP TABLE IF EXISTS habit_entries_old;`);
      console.log("✓ Dropped old habit_entries table");
    }

    // Drop unused users table if exists
    await db.execute(sql`DROP TABLE IF EXISTS users;`);
    console.log("✓ Dropped unused users table");

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

void migrate();
