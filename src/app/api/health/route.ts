import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 }); // lightest possible Atlas round-trip
    return NextResponse.json(
      {
        status: "ok",
        db: db.databaseName,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[health] MongoDB connection failed:", message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}