import { config } from "dotenv";
import { createDbClient } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const { db, close } = createDbClient(url);
  try {
    await runMigrations(db);
    console.log("migrations applied");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
