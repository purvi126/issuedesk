import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "issues";

// GET /api/issues
export async function GET() {
  try {
    const db = await getDb();
    const issues = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ issues }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issues GET] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/issues
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc = {
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      status: "open",
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(doc);

    return NextResponse.json(
      { insertedId: result.insertedId, issue: doc },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issues POST] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}