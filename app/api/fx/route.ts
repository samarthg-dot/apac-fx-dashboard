import { NextResponse } from "next/server"
import { getFxSnapshot } from "@/lib/fx-data"

export async function GET() {
  const data = await getFxSnapshot()

  return NextResponse.json(data)
}
