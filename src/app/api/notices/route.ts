import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "notices";

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    await db.collection(COLLECTION).deleteMany({
      expiresAt: { $lte: now },
    });

    const notices = await db
      .collection(COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const safeNotices = notices.map((notice: any) => ({
      ...notice,
      _id: notice._id?.toString?.() ?? "",
      createdAt:
        notice.createdAt instanceof Date
          ? notice.createdAt.toISOString()
          : notice.createdAt,
      expiresAt:
        notice.expiresAt instanceof Date
          ? notice.expiresAt.toISOString()
          : notice.expiresAt,
    }));

    return NextResponse.json({ ok: true, notices: safeNotices }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[notices GET] Failed:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, body: noticeBody, durationHours } = body as {
      title?: string;
      body?: string;
      durationHours?: number;
    };

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 }
      );
    }

    if (!noticeBody || typeof noticeBody !== "string" || !noticeBody.trim()) {
      return NextResponse.json(
        { ok: false, error: "body is required" },
        { status: 400 }
      );
    }

    const hours =
      typeof durationHours === "number" &&
      Number.isFinite(durationHours) &&
      durationHours > 0
        ? durationHours
        : 24;

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + hours * 60 * 60 * 1000);

    const doc = {
      title: title.trim(),
      body: noticeBody.trim(),
      createdAt,
      expiresAt,
    };

    const db = await getDb();
    const result = await db.collection(COLLECTION).insertOne(doc);

    return NextResponse.json(
      {
        ok: true,
        notice: {
          ...doc,
          _id: result.insertedId.toString(),
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[notices POST] Failed:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}