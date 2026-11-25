import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() { const user=await getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json(await db.prepare("SELECT a.*, c.name crop_name FROM activities a LEFT JOIN crops c ON c.id=a.crop_id WHERE a.user_id=? ORDER BY happened_on DESC,a.id DESC").all(user.id)); }
export async function POST(req:Request) { const user=await getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401}); const a=await req.json(); if(!a.kind||!a.details?.trim()||!a.happened_on)return NextResponse.json({error:"Activity, details and date are required."},{status:400}); if(a.crop_id&&!await db.prepare("SELECT id FROM crops WHERE id=? AND user_id=?").get(Number(a.crop_id),user.id))return NextResponse.json({error:"Select one of your crops."},{status:400}); await db.prepare("INSERT INTO activities(user_id,crop_id,kind,details,happened_on) VALUES(?,?,?,?,?)").run(user.id,a.crop_id||null,a.kind,a.details.trim(),a.happened_on); return NextResponse.json({ok:true}); }
