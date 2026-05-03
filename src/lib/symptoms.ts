import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

import { type DB, schema } from "@/db/client";
import type { SymptomEntry, SymptomType } from "@/db/schema";

export interface LogSymptomInput {
  userId: string;
  symptomSlug: string;
  /** YYYY-MM-DD in the user's local calendar. */
  occurredOn: string;
  /** 0..3 ordinal severity. Required unless the symptom is numeric-only. */
  severity?: number | null;
  /** Numeric value (e.g. weight kg, hours slept) as a decimal string. */
  valueNumeric?: string | null;
  notes?: string | null;
}

export class SymptomLogError extends Error {
  constructor(
    public readonly code: "unknown_symptom" | "invalid_input",
    message: string,
  ) {
    super(message);
    this.name = "SymptomLogError";
  }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function logSymptomEntry(
  db: DB,
  input: LogSymptomInput,
): Promise<SymptomEntry> {
  if (!ISO_DATE_RE.test(input.occurredOn)) {
    throw new SymptomLogError(
      "invalid_input",
      "occurredOn must be a YYYY-MM-DD calendar date",
    );
  }
  if (
    input.severity != null &&
    (input.severity < 0 ||
      input.severity > 3 ||
      !Number.isInteger(input.severity))
  ) {
    throw new SymptomLogError(
      "invalid_input",
      "severity must be an integer between 0 and 3",
    );
  }

  const [type] = await db
    .select()
    .from(schema.symptomTypes)
    .where(eq(schema.symptomTypes.slug, input.symptomSlug))
    .limit(1);
  if (!type) {
    throw new SymptomLogError(
      "unknown_symptom",
      `Unknown symptom slug: ${input.symptomSlug}`,
    );
  }
  if (type.hasSeverity && input.severity == null && !type.hasNumericValue) {
    throw new SymptomLogError(
      "invalid_input",
      `Symptom ${type.slug} requires a severity value`,
    );
  }
  if (
    type.hasNumericValue &&
    !type.hasSeverity &&
    (input.valueNumeric == null || input.valueNumeric === "")
  ) {
    throw new SymptomLogError(
      "invalid_input",
      `Symptom ${type.slug} requires a numeric value`,
    );
  }

  const [row] = await db
    .insert(schema.symptomEntries)
    .values({
      userId: input.userId,
      symptomSlug: input.symptomSlug,
      occurredOn: input.occurredOn,
      severity: input.severity ?? null,
      valueNumeric: input.valueNumeric ?? null,
      notes: input.notes ?? null,
    })
    .returning();
  return row;
}

export interface ListSymptomEntriesQuery {
  userId: string;
  /** Inclusive YYYY-MM-DD lower bound. */
  from?: string;
  /** Inclusive YYYY-MM-DD upper bound. */
  to?: string;
  limit?: number;
}

export async function listSymptomEntries(
  db: DB,
  q: ListSymptomEntriesQuery,
): Promise<SymptomEntry[]> {
  const filters = [eq(schema.symptomEntries.userId, q.userId)];
  if (q.from) filters.push(gte(schema.symptomEntries.occurredOn, q.from));
  if (q.to) filters.push(lte(schema.symptomEntries.occurredOn, q.to));
  return db
    .select()
    .from(schema.symptomEntries)
    .where(and(...filters))
    .orderBy(
      desc(schema.symptomEntries.occurredOn),
      asc(schema.symptomEntries.createdAt),
    )
    .limit(q.limit ?? 200);
}

export async function listActiveSymptomTypes(db: DB): Promise<SymptomType[]> {
  return db
    .select()
    .from(schema.symptomTypes)
    .orderBy(
      asc(schema.symptomTypes.category),
      asc(schema.symptomTypes.sortOrder),
    );
}
