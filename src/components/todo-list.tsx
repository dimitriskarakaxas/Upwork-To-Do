"use client";

import type { Todo } from "@/lib/types";
import { TodoItem } from "./todo-item";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
};

export function TodoList({ todos, onToggle, onDelete, onUpdate }: Props) {
  if (todos.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        Nothing here yet. Add your first task above.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-800">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
