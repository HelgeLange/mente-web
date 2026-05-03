import { sql } from "drizzle-orm";

import { symptomTypeSeed } from "./seed-data/symptom-types";
import { type DB, schema } from "./client";

// Idempotent: safe to run on every deploy. Inserts new slugs, updates label
// and category for existing rows so content edits roll out via seed.
export async function seedSymptomTypes(db: DB): Promise<void> {
  if (symptomTypeSeed.length === 0) return;
  await db
    .insert(schema.symptomTypes)
    .values(symptomTypeSeed)
    .onConflictDoUpdate({
      target: schema.symptomTypes.slug,
      set: {
        labelEs: sql`excluded.label_es`,
        category: sql`excluded.category`,
        sortOrder: sql`excluded.sort_order`,
        hasSeverity: sql`excluded.has_severity`,
        hasNumericValue: sql`excluded.has_numeric_value`,
        numericUnit: sql`excluded.numeric_unit`,
      },
    });
}
