import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "issues";

type IssueComment = {
  id: string;
  text: string;
  createdAt: number;
};

type PatchBody = {
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  reviewState?: "PENDING" | "ASSIGNED" | "REJECTED";
  commentText?: string;
  toggleUpvote?: boolean;
  voterId?: string;
};

// GET /api/issues/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid issue id" }, { status: 400 });
    }

    const db = await getDb();
    const issue = await db
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, issue }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issue GET by id] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/issues/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid issue id" }, { status: 400 });
    }

    const body = (await req.json()) as PatchBody;
    const { status, reviewState, commentText, toggleUpvote, voterId } = body;

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    const allowedReviewStates = ["PENDING", "ASSIGNED", "REJECTED"];

    const db = await getDb();
    const collection = db.collection(COLLECTION);
    const issueId = new ObjectId(id);

    const existingIssue = await collection.findOne({ _id: issueId });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // 1) Toggle upvote
    if (toggleUpvote) {
      const cleanVoterId = typeof voterId === "string" ? voterId.trim() : "";

      if (!cleanVoterId) {
        return NextResponse.json(
          { error: "voterId is required" },
          { status: 400 }
        );
      }

      const currentUpvotedBy = Array.isArray(existingIssue.upvotedBy)
        ? existingIssue.upvotedBy.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      const hasUpvoted = currentUpvotedBy.includes(cleanVoterId);

      const nextUpvotedBy = hasUpvoted
        ? currentUpvotedBy.filter((value) => value !== cleanVoterId)
        : [...currentUpvotedBy, cleanVoterId];

      const updateResult = await collection.updateOne(
        { _id: issueId },
        {
          $set: {
            upvotedBy: nextUpvotedBy,
            upvoteCount: nextUpvotedBy.length,
            updatedAt: new Date(),
          },
        }
      );

      if (!updateResult.matchedCount) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      const updatedIssue = await collection.findOne({ _id: issueId });

      if (!updatedIssue) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, issue: updatedIssue }, { status: 200 });
    }

    // 2) Add comment
    const cleanComment =
      typeof commentText === "string" ? commentText.trim() : "";

    if (cleanComment) {
      const nextComment: IssueComment = {
        id: crypto.randomUUID(),
        text: cleanComment,
        createdAt: Date.now(),
      };

      const updateResult = await collection.updateOne(
        { _id: issueId },
        {
          $set: {
            updatedAt: new Date(),
          },
          $push: {
            comments: nextComment,
          },
        } as any
      );

      if (!updateResult.matchedCount) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      const updatedIssue = await collection.findOne({ _id: issueId });

      if (!updatedIssue) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, issue: updatedIssue }, { status: 200 });
    }

    // 3) Status / review state updates
    const updateDoc: {
      updatedAt: Date;
      status?: string;
      reviewState?: string;
      resolvedAt?: Date | null;
    } = {
      updatedAt: new Date(),
    };

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      updateDoc.status = status;
      updateDoc.resolvedAt = status === "RESOLVED" ? new Date() : null;
    }

    if (reviewState) {
      if (!allowedReviewStates.includes(reviewState)) {
        return NextResponse.json(
          { error: "Invalid reviewState value" },
          { status: 400 }
        );
      }

      updateDoc.reviewState = reviewState;
    }

    if (!("status" in updateDoc) && !("reviewState" in updateDoc)) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const result = await collection.findOneAndUpdate(
      { _id: issueId },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, issue: result }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[issue PATCH by id] Failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}