import { createHash, randomBytes } from "node:crypto";

// We hand the user a high-entropy random token, but only ever store its hash
// in Postgres. Same shape as a session id leak: leaking the row gives an
// attacker hashes, not usable tokens.

export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
