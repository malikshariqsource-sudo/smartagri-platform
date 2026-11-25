import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() { const user = await getUser(); if (!user) return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json(await db.prepare("SELECT * FROM crops WHERE user_id=? ORDER BY created_at DESC").all(user.id)); }
export async function POST(req: Request) { const user = await getUser(); if (!user) return NextResponse.json({error:"Unauthorized"},{status:401}); const c = await req.json(); if (![c.name,c.planted_on,c.harvest_on].every(v=>typeof v==="string"&&v.trim()) || c.harvest_on < c.planted_on) return NextResponse.json({error:"Name and valid planting/harvest dates are required."},{status:400}); const result = await db.prepare("INSERT INTO crops(user_id,name,variety,area,planted_on,harvest_on,status) VALUES(?,?,?,?,?,?,?)").run(user.id,c.name.trim(),c.variety||"",c.area||"",c.planted_on,c.harvest_on,c.status||"Growing"); return NextResponse.json({id:Number(result.lastInsertRowid)}); }
