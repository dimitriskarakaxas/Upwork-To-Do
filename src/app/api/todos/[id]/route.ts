import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getTodos } from "@/lib/mongodb";
import { serializeTodo } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const _id = toObjectId(id);
  if (!_id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { text?: unknown; completed?: unknown }
    | null;

  const update: { text?: string; completed?: boolean } = {};
  if (typeof body?.text === "string") {
    const trimmed = body.text.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Text cannot be empty" }, { status: 400 });
    }
    update.text = trimmed;
  }
  if (typeof body?.completed === "boolean") {
    update.completed = body.completed;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const todos = await getTodos();
  const doc = await todos.findOneAndUpdate(
    { _id },
    { $set: update },
    { returnDocument: "after" }
  );
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeTodo(doc));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const _id = toObjectId(id);
  if (!_id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const todos = await getTodos();
  const result = await todos.deleteOne({ _id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
