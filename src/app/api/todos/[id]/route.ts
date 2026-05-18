import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getTodos } from "@/lib/mongodb";
import { serializeTodo } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function errorResponse(label: string, err: unknown) {
  const e = err as { name?: string; message?: string; code?: unknown; cause?: unknown };
  console.error(`[api/todos/:id] ${label} failed`, {
    name: e.name,
    message: e.message,
    code: e.code,
    cause: e.cause,
  });
  return NextResponse.json(
    { error: e.message ?? "Internal error", name: e.name, code: e.code },
    { status: 500 }
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
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
    console.log("[api/todos/:id] PATCH ok", { id });
    return NextResponse.json(serializeTodo(doc));
  } catch (err) {
    return errorResponse("PATCH", err);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
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
    console.log("[api/todos/:id] DELETE ok", { id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse("DELETE", err);
  }
}
