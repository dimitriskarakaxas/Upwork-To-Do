"use client";

import { useEffect, useMemo, useState } from "react";
import type { Filter, Todo } from "@/lib/types";
import { TodoInput } from "./todo-input";
import { TodoList } from "./todo-list";
import { TodoFilters } from "./todo-filters";

const STORAGE_KEY = "todos:v1";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTodo = (id: string, text: string) => {
    const trimmed = text.trim();
    setTodos((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, text: trimmed } : t))
        .filter((t) => t.text.length > 0)
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-950/60 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="p-4 sm:p-6">
        <TodoInput onAdd={addTodo} />
      </div>

      <div className="border-t border-neutral-800">
        <TodoList
          todos={visibleTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />
      </div>

      {todos.length > 0 && (
        <div className="border-t border-neutral-800 p-3 sm:p-4">
          <TodoFilters
            filter={filter}
            onChange={setFilter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
        </div>
      )}
    </section>
  );
}
