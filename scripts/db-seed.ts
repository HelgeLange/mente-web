import { config } from "dotenv";
import { createDbClient } from "../src/db/client";
import { seedSymptomTypes } from "../src/db/seed";

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
    await seedSymptomTypes(db);
    console.log("symptom_types seeded");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
