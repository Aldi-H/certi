import { NextResponse } from "next/server";

export async function GET() {
  const from = process.env.SMTP_FROM || "Not Configured";
  return NextResponse.json({ from });
}
