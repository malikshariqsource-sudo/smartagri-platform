import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { setSession } from "@/lib/auth";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  const user = await db.prepare("SELECT id,password_hash FROM users WHERE email = ?").get(email.toLowerCase().trim()) as {id:number;password_hash:string}|undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await setSession(user.id); return NextResponse.json({ ok: true });
}
