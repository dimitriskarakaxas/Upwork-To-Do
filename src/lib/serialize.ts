import type { WithId } from "mongodb";
import type { TodoDoc } from "./mongodb";
import type { Todo } from "./types";

export function serializeTodo(doc: WithId<TodoDoc>): Todo {
  return {
    id: doc._id.toString(),
    text: doc.text,
    completed: doc.completed,
    created_at: doc.createdAt.toISOString(),
  };
}
