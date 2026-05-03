import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  smallint,
  boolean,
  date,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Severity is captured on a 0-3 ordinal scale across all symptom types.
// 0 = ninguno, 1 = leve, 2 = moderado, 3 = intenso.
// See seed file for the canonical Spanish vocabulary.

export const cycleEventKind = pgEnum("cycle_event_kind", [
  "menstruation_start",
  "menstruation_end",
  "spotting",
  "ovulation_suspected",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    locale: text("locale").notNull().default("es"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_unique_idx")
      .on(sql`lower(${t.email})`)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const magicLinkTokens = pgTable(
  "magic_link_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("magic_link_tokens_token_hash_idx").on(t.tokenHash),
    index("magic_link_tokens_email_idx").on(sql`lower(${t.email})`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("sessions_token_hash_idx").on(t.tokenHash),
    index("sessions_user_id_idx").on(t.userId),
  ],
);

// Catalog of trackable symptoms. Authored in Spanish; rendered as-is in UI.
export const symptomTypes = pgTable("symptom_types", {
  // Stable string slug, used in code and seeds. e.g. "sofocos".
  slug: text("slug").primaryKey(),
  // Spanish label shown to users. May be tagged [ES-DRAFT] until a content
  // lead reviews it.
  labelEs: text("label_es").notNull(),
  // Broad grouping (vasomotor, mood, sleep, …). Spanish slugs ok.
  category: text("category").notNull(),
  // Sort order within category for the daily-log UI.
  sortOrder: integer("sort_order").notNull().default(0),
  // 0 = ninguno, 1 = leve, 2 = moderado, 3 = intenso.
  // Some symptoms (e.g. peso, horas de sueño) want a numeric value instead;
  // those set this to false and use `value_numeric` on the entry.
  hasSeverity: boolean("has_severity").notNull().default(true),
  // True iff this symptom expects `value_numeric` (weight kg, hours slept, …).
  hasNumericValue: boolean("has_numeric_value").notNull().default(false),
  // Unit hint for numeric values, e.g. "kg", "h". Spanish abbreviations.
  numericUnit: text("numeric_unit"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const symptomEntries = pgTable(
  "symptom_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    symptomSlug: text("symptom_slug")
      .notNull()
      .references(() => symptomTypes.slug, { onDelete: "restrict" }),
    // Local date the entry is logged for (the user's "today"). Stored as
    // calendar date so a single day's entries group naturally.
    occurredOn: date("occurred_on").notNull(),
    // 0..3 ordinal severity, nullable for purely-numeric symptoms.
    severity: smallint("severity"),
    // Numeric value for symptoms like weight or hours slept.
    valueNumeric: text("value_numeric"),
    // Free-text note from the user. Treated as sensitive.
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("symptom_entries_user_day_idx").on(t.userId, t.occurredOn),
    index("symptom_entries_user_symptom_idx").on(t.userId, t.symptomSlug),
  ],
);

export const cycleEvents = pgTable(
  "cycle_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: cycleEventKind("kind").notNull(),
    occurredOn: date("occurred_on").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("cycle_events_user_day_idx").on(t.userId, t.occurredOn),
    // A given user shouldn't have two identical kind+day events.
    uniqueIndex("cycle_events_user_kind_day_uidx").on(
      t.userId,
      t.kind,
      t.occurredOn,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SymptomType = typeof symptomTypes.$inferSelect;
export type SymptomEntry = typeof symptomEntries.$inferSelect;
export type NewSymptomEntry = typeof symptomEntries.$inferInsert;
export type CycleEvent = typeof cycleEvents.$inferSelect;
export type NewCycleEvent = typeof cycleEvents.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
