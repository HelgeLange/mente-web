import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | undefined;

export function getDb(): DB {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. See .env.example for the expected format.",
    );
  }
  const sql = postgres(url, { prepare: false });
  _db = drizzle(sql, { schema });
  return _db;
}

// Build a one-off client against an arbitrary URL — used by tests and the
// migration runner. The caller is responsible for closing the underlying pool.
export function createDbClient(url: string): {
  db: DB;
  close: () => Promise<void>;
} {
  const sql = postgres(url, { prepare: false });
  const db = drizzle(sql, { schema });
  return { db, close: async () => sql.end({ timeout: 5 }) };
}

export { schema };
