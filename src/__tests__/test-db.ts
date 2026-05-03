import { sql } from "drizzle-orm";

import { createDbClient, type DB, schema } from "@/db/client";
import { runMigrations } from "@/db/migrate";
import { seedSymptomTypes } from "@/db/seed";

export interface TestDb {
  db: DB;
  close: () => Promise<void>;
}

export async function setupTestDb(): Promise<TestDb> {
  const url = process.env.TEST_DATABASE_URL;
  if (url) {
    const handle = createDbClient(url);
    await handle.db.execute(sql`drop schema if exists public cascade`);
    await handle.db.execute(sql`create schema public`);
    await runMigrations(handle.db);
    await seedSymptomTypes(handle.db);
    return handle;
  }

  // Fallback: in-process Postgres (pglite). Same SQL dialect as the real
  // server, so schema/migrations are exercised faithfully without requiring
  // a running database. CI sets TEST_DATABASE_URL and uses Postgres directly.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as DB;
  await migrate(db as never, { migrationsFolder: "./drizzle" });
  await seedSymptomTypes(db);
  return {
    db,
    close: async () => {
      await client.close();
    },
  };
}
