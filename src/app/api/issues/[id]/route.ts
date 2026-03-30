import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "issues";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };
    const issue = await db.collection(COLLECTION).findOne(query);

    if (!issue) {
      return NextResponse.json({ ok: false, error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ok: true,
        issue: {
          ...issue,
          _id: issue._id?.toString?.() ?? "",
          createdAt:
            issue.createdAt instanceof Date
              ? issue.createdAt.toISOString()
              : issue.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[issue GET] Failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const db = await getDb();

    const updateFields: Record<string, unknown> = {};

    if (typeof body.status === "string" && body.status.trim()) {
      updateFields.status = body.status.trim();
    }

    if (typeof body.reviewState === "string" && body.reviewState.trim()) {
      updateFields.reviewState = body.reviewState.trim();
    }

    if (typeof body.priority === "string" && body.priority.trim()) {
      updateFields.priority = body.priority.trim();
    }

    if (typeof body.title === "string" && body.title.trim()) {
      updateFields.title = body.title.trim();
    }

    if (typeof body.description === "string" && body.description.trim()) {
      updateFields.description = body.description.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id as any };

    const result = await db.collection(COLLECTION).findOneAndUpdate(
      query,
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ ok: false, error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ok: true,
        issue: {
          ...result,
          _id: result._id?.toString?.() ?? "",
          createdAt:
            result.createdAt instanceof Date
              ? result.createdAt.toISOString()
              : result.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[issue PATCH] Failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}