import { migrate } from "drizzle-orm/postgres-js/migrator";

import { type DB } from "./client";

export async function runMigrations(db: DB): Promise<void> {
  await migrate(db, { migrationsFolder: "./drizzle" });
}
