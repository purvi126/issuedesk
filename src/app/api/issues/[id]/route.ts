import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "issues";

type IssueComment = {
    id: string;
    text: string;
    createdAt: number;
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

        const body = await req.json();
        const { status, reviewState, commentText } = body as {
            status?: "OPEN" | "IN_PROGRESS" | "RESOLVED";
            reviewState?: "PENDING" | "ASSIGNED" | "REJECTED";
            commentText?: string;
        };

        const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
        const allowedReviewStates = ["PENDING", "ASSIGNED", "REJECTED"];

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

            if (status === "RESOLVED") {
                updateDoc.resolvedAt = new Date();
            } else {
                updateDoc.resolvedAt = null;
            }
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

        const cleanComment =
            typeof commentText === "string" ? commentText.trim() : "";

        const db = await getDb();

        if (cleanComment) {
            const nextComment: IssueComment = {
                id: crypto.randomUUID(),
                text: cleanComment,
                createdAt: Date.now(),
            };

            const commentUpdate = {
                $set: updateDoc,
                $push: { comments: nextComment },
            } as any;

            const result = await db.collection(COLLECTION).findOneAndUpdate(
                { _id: new ObjectId(id) },
                commentUpdate,
                { returnDocument: "after" }
            );

            if (!result) {
                return NextResponse.json({ error: "Issue not found" }, { status: 404 });
            }

            return NextResponse.json({ ok: true, issue: result }, { status: 200 });
        }

        if (!("status" in updateDoc) && !("reviewState" in updateDoc)) {
            return NextResponse.json(
                { error: "No valid fields provided" },
                { status: 400 }
            );
        }

        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { _id: new ObjectId(id) },
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