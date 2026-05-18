import { NextResponse } from "next/server";
import { getTodos } from "@/lib/mongodb";
import { serializeTodo } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  const todos = await getTodos();
  const docs = await todos.find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(serializeTodo));
}

export async function POST(request: Request) {
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

  return NextResponse.json(
    serializeTodo({ _id: result.insertedId, text, completed: false, createdAt }),
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("completed") !== "true") {
    return NextResponse.json(
      { error: "Specify ?completed=true to clear completed todos" },
      { status: 400 }
    );
  }

  const todos = await getTodos();
  const result = await todos.deleteMany({ completed: true });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
