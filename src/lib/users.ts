import { and, eq, isNull, sql } from "drizzle-orm";

import { type DB, schema } from "@/db/client";
import type { User } from "@/db/schema";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Email belongs to one active (non-deleted) user. We never expose
// soft-deleted users via this API.
export async function findActiveUserByEmail(
  db: DB,
  email: string,
): Promise<User | null> {
  const rows = await db
    .select()
    .from(schema.users)
    .where(
      and(
        sql`lower(${schema.users.email}) = ${normalizeEmail(email)}`,
        isNull(schema.users.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserById(db: DB, id: string): Promise<User | null> {
  const rows = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), isNull(schema.users.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrCreateUserByEmail(
  db: DB,
  email: string,
): Promise<User> {
  const existing = await findActiveUserByEmail(db, email);
  if (existing) return existing;
  const [created] = await db
    .insert(schema.users)
    .values({ email: normalizeEmail(email) })
    .returning();
  return created;
}

// Soft delete: keeps row for foreign-key integrity and audit, hides from
// active queries. Symptom entries remain owned by the deleted user row but
// are not addressable through findActiveUserByEmail.
export async function softDeleteUser(db: DB, id: string): Promise<boolean> {
  const result = await db
    .update(schema.users)
    .set({ deletedAt: new Date() })
    .where(and(eq(schema.users.id, id), isNull(schema.users.deletedAt)))
    .returning({ id: schema.users.id });
  return result.length > 0;
}
