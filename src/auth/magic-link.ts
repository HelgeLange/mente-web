import { and, eq, gt, isNull } from "drizzle-orm";

import { type DB, schema } from "@/db/client";
import { generateToken, hashToken } from "./tokens";
import { createSession, type Session } from "./sessions";
import { getOrCreateUserByEmail } from "@/lib/users";
import type { User } from "@/db/schema";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface IssuedMagicLink {
  /** The raw token to embed in the email link. Never stored. */
  token: string;
  expiresAt: Date;
}

export async function issueMagicLink(
  db: DB,
  email: string,
  now: Date = new Date(),
): Promise<IssuedMagicLink> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(now.getTime() + FIFTEEN_MINUTES_MS);
  await db.insert(schema.magicLinkTokens).values({
    email: normalizeEmail(email),
    tokenHash,
    expiresAt,
  });
  return { token, expiresAt };
}

export interface MagicLinkRedemption {
  user: User;
  session: Session;
  sessionToken: string;
}

export class MagicLinkError extends Error {
  constructor(
    public readonly code: "invalid" | "expired" | "consumed",
    message: string,
  ) {
    super(message);
    this.name = "MagicLinkError";
  }
}

// Single-use: marks the token consumed inside the same transaction we use to
// look it up, so a leaked link can't be redeemed twice.
export async function redeemMagicLink(
  db: DB,
  token: string,
  now: Date = new Date(),
): Promise<MagicLinkRedemption> {
  const tokenHash = hashToken(token);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.magicLinkTokens)
      .where(
        and(
          eq(schema.magicLinkTokens.tokenHash, tokenHash),
          isNull(schema.magicLinkTokens.consumedAt),
          gt(schema.magicLinkTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!row) {
      throw new MagicLinkError(
        "invalid",
        "Magic link is invalid, expired, or already used.",
      );
    }

    await tx
      .update(schema.magicLinkTokens)
      .set({ consumedAt: now })
      .where(eq(schema.magicLinkTokens.id, row.id));

    const user = await getOrCreateUserByEmail(tx as unknown as DB, row.email);
    const issued = await createSession(tx as unknown as DB, user.id, now);

    return {
      user,
      session: issued.session,
      sessionToken: issued.token,
    };
  });
}
