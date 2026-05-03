import { and, eq, gt, isNull } from "drizzle-orm";

import { type DB, schema } from "@/db/client";
import type { Session, User } from "@/db/schema";
import { generateToken, hashToken } from "./tokens";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface IssuedSession {
  /** Raw session token; set on the client cookie. Never persisted. */
  token: string;
  session: Session;
}

export async function createSession(
  db: DB,
  userId: string,
  now: Date = new Date(),
): Promise<IssuedSession> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
  const [session] = await db
    .insert(schema.sessions)
    .values({ userId, tokenHash, expiresAt })
    .returning();
  return { token, session };
}

export interface AuthenticatedSession {
  user: User;
  session: Session;
}

export async function getSessionByToken(
  db: DB,
  token: string,
  now: Date = new Date(),
): Promise<AuthenticatedSession | null> {
  const tokenHash = hashToken(token);
  const rows = await db
    .select({ session: schema.sessions, user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        isNull(schema.sessions.revokedAt),
        gt(schema.sessions.expiresAt, now),
        isNull(schema.users.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function revokeSession(db: DB, sessionId: string): Promise<void> {
  await db
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.id, sessionId));
}

export type { Session };
