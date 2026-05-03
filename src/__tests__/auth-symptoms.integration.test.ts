// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import type { DB } from "@/db/client";
import { setupTestDb } from "./test-db";
import { issueMagicLink, redeemMagicLink } from "@/auth/magic-link";
import { getSessionByToken, revokeSession } from "@/auth/sessions";
import { findUserById, softDeleteUser } from "@/lib/users";
import {
  listSymptomEntries,
  logSymptomEntry,
  SymptomLogError,
} from "@/lib/symptoms";

describe("auth + symptoms integration", () => {
  let db: DB;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const handle = await setupTestDb();
    db = handle.db;
    close = handle.close;
  }, 60_000);

  afterAll(async () => {
    if (close) await close();
  });

  test("magic link → session → log symptom → retrieve → soft delete", async () => {
    const email = "ana@example.test";

    const link = await issueMagicLink(db, email);
    const redeemed = await redeemMagicLink(db, link.token);
    expect(redeemed.user.email).toBe(email);

    const sessionLookup = await getSessionByToken(db, redeemed.sessionToken);
    expect(sessionLookup).not.toBeNull();
    expect(sessionLookup!.user.id).toBe(redeemed.user.id);

    // Magic links are single-use.
    await expect(redeemMagicLink(db, link.token)).rejects.toMatchObject({
      name: "MagicLinkError",
    });

    const today = new Date().toISOString().slice(0, 10);
    const sofocos = await logSymptomEntry(db, {
      userId: redeemed.user.id,
      symptomSlug: "sofocos",
      occurredOn: today,
      severity: 2,
      notes: "Tres sofocos antes del mediodía.",
    });
    expect(sofocos.symptomSlug).toBe("sofocos");

    const peso = await logSymptomEntry(db, {
      userId: redeemed.user.id,
      symptomSlug: "peso",
      occurredOn: today,
      valueNumeric: "68.4",
    });
    expect(peso.valueNumeric).toBe("68.4");

    // Numeric-only symptom rejects empty payload.
    await expect(
      logSymptomEntry(db, {
        userId: redeemed.user.id,
        symptomSlug: "peso",
        occurredOn: today,
      }),
    ).rejects.toBeInstanceOf(SymptomLogError);

    const entries = await listSymptomEntries(db, {
      userId: redeemed.user.id,
      from: today,
      to: today,
    });
    const slugs = entries.map((e) => e.symptomSlug).sort();
    expect(slugs).toEqual(["peso", "sofocos"]);

    await revokeSession(db, redeemed.session.id);
    expect(await getSessionByToken(db, redeemed.sessionToken)).toBeNull();

    expect(await findUserById(db, redeemed.user.id)).not.toBeNull();
    expect(await softDeleteUser(db, redeemed.user.id)).toBe(true);
    expect(await findUserById(db, redeemed.user.id)).toBeNull();
  });
});
