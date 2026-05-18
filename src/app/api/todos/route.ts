import { NextResponse } from "next/server";
import { getTodos } from "@/lib/mongodb";
import { serializeTodo } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function errorResponse(label: string, err: unknown) {
  const e = err as { name?: string; message?: string; code?: unknown; cause?: unknown };
  console.error(`[api/todos] ${label} failed`, {
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

export async function GET() {
  try {
    console.log("[api/todos] GET start");
    const todos = await getTodos();
    const docs = await todos.find().sort({ createdAt: -1 }).toArray();
    console.log("[api/todos] GET ok", { count: docs.length });
    return NextResponse.json(docs.map(serializeTodo));
  } catch (err) {
    return errorResponse("GET", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { text?: unknown }
      | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const todos = await getTodos();
    const createdAt = new Date();
    const result = await todos.insertOne({ text, completed: false, createdAt });
    console.log("[api/todos] POST ok", { id: result.insertedId.toString() });

    return NextResponse.json(
      serializeTodo({ _id: result.insertedId, text, completed: false, createdAt }),
      { status: 201 }
    );
  } catch (err) {
    return errorResponse("POST", err);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("completed") !== "true") {
      return NextResponse.json(
        { error: "Specify ?completed=true to clear completed todos" },
        { status: 400 }
      );
    }

    const todos = await getTodos();
    const result = await todos.deleteMany({ completed: true });
    console.log("[api/todos] DELETE clear ok", { deletedCount: result.deletedCount });
    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (err) {
    return errorResponse("DELETE", err);
  }
}
