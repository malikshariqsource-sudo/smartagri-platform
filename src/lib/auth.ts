import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import db from "@/lib/db";

const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-secret-change-me");
function sign(value: string) { if (!secret) throw new Error("SESSION_SECRET must be configured"); return createHmac("sha256", secret).update(value).digest("hex"); }
export async function setSession(userId: number) { const payload = `${userId}.${Date.now() + 1000 * 60 * 60 * 24 * 14}`; const jar = await cookies(); jar.set("smartagri_session", `${payload}.${sign(payload)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 }); }
export async function getUser() {
  const jar = await cookies(); const token = jar.get("smartagri_session")?.value; if (!token || !secret) return null;
  const parts = token.split("."); if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`; const expected = sign(payload);
  try { if (!timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]))) return null; } catch { return null; }
  if (!/^\d+$/.test(parts[0]) || Number(parts[1]) < Date.now()) return null;
  const row = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(Number(parts[0])) as { id: number; email: string; name: string } | undefined;
  return row ? { id: row.id, email: row.email, name: row.name } : null;
}
export async function clearSession() { const jar = await cookies(); jar.delete("smartagri_session"); }
