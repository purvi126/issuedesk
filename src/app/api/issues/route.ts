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
      .limit(50)
      .toArray();

    const safeIssues = issues.map((issue: any) => ({
      ...issue,
      _id: issue._id?.toString?.() ?? "",
      createdAt:
        issue.createdAt instanceof Date
          ? issue.createdAt.toISOString()
          : issue.createdAt,
    }));

    return NextResponse.json({ ok: true, issues: safeIssues }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issues GET] Failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// POST /api/issues
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      category,
      priority,
      section,
      hostelGender,
      hostelName,
      hostelBlock,
      campusBlock,
      roomNumber,
      locationText,
      createdByEmail,
      createdById,
      attachmentName,
    } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { ok: false, error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
      return NextResponse.json(
        { ok: false, error: "description is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const normalizedCreatedByEmail =
      typeof createdByEmail === "string" && createdByEmail.trim()
        ? createdByEmail.trim().toLowerCase()
        : typeof createdById === "string" && createdById.trim()
        ? createdById.trim().toLowerCase()
        : "";

    const db = await getDb();

    const doc = {
      title: title.trim(),
      description: description.trim(),
      category: typeof category === "string" ? category.trim() : "",
      priority: typeof priority === "string" ? priority.trim() : "LOW",
      section: typeof section === "string" ? section.trim() : "",
      hostelGender: typeof hostelGender === "string" ? hostelGender.trim() : "",
      hostelName: typeof hostelName === "string" ? hostelName.trim() : "",
      hostelBlock: typeof hostelBlock === "string" ? hostelBlock.trim() : "",
      campusBlock: typeof campusBlock === "string" ? campusBlock.trim() : "",
      roomNumber: typeof roomNumber === "string" ? roomNumber.trim() : "",
      locationText: typeof locationText === "string" ? locationText.trim() : "",
      attachmentName: typeof attachmentName === "string" ? attachmentName.trim() : "",
      createdByEmail: normalizedCreatedByEmail,
      createdById: normalizedCreatedByEmail,
      status: "OPEN",
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(doc);

    return NextResponse.json(
      {
        ok: true,
        insertedId: result.insertedId.toString(),
        issue: {
          ...doc,
          _id: result.insertedId.toString(),
          createdAt: doc.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issues POST] Failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}