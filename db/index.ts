import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Please add it to your environment variables.",
  );
}

// Configure for serverless environments (Vercel, etc.)
// Use connection pooling with pgbouncer for better performance
const client = postgres(process.env.DATABASE_URL, {
  prepare: false, // Disable prepared statements for pgbouncer compatibility
});

export const db = drizzle(client, { schema });
