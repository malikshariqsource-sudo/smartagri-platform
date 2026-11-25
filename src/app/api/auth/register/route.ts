import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { setSession } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (typeof name !== "string" || name.trim().length < 2 || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "Enter a name, valid email and password with at least 8 characters." }, { status: 400 });
    const result = db.prepare("INSERT INTO users(email,name,password_hash) VALUES(?,?,?)").run(email.toLowerCase().trim(), name.trim(), await bcrypt.hash(password, 12));
    await setSession(Number(result.lastInsertRowid)); return NextResponse.json({ ok: true });
  } catch (e) { const message = String(e).includes("UNIQUE") ? "An account with this email already exists." : "Could not create your account."; return NextResponse.json({ error: message }, { status: 400 }); }
}
