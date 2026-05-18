"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Filter, Todo } from "@/lib/types";
import { TodoInput } from "./todo-input";
import { TodoList } from "./todo-list";
import { TodoFilters } from "./todo-filters";

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    const res = await fetch("/api/todos", { cache: "no-store" });
    if (!res.ok) {
      setError(await parseError(res));
      return;
    }
    setTodos((await res.json()) as Todo[]);
    setError(null);
  }, []);

  useEffect(() => {
    loadTodos().finally(() => setLoading(false));
  }, [loadTodos]);

  const addTodo = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });

    if (!res.ok) {
      setError(await parseError(res));
      return;
    }
    const created = (await res.json()) as Todo;
    setTodos((prev) => [created, ...prev]);
  };

  const toggleTodo = async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;

    const nextCompleted = !current.completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted }),
    });

    if (!res.ok) {
      setError(await parseError(res));
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t))
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(await parseError(res));
      setTodos(snapshot);
    }
  };

  const updateTodo = async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return deleteTodo(id);
    }

    const snapshot = todos;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
    );

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });

    if (!res.ok) {
      setError(await parseError(res));
      setTodos(snapshot);
    }
  };

  const clearCompleted = async () => {
    const snapshot = todos;
    const hasCompleted = todos.some((t) => t.completed);
    if (!hasCompleted) return;

    setTodos((prev) => prev.filter((t) => !t.completed));

    const res = await fetch("/api/todos?completed=true", { method: "DELETE" });
    if (!res.ok) {
      setError(await parseError(res));
      setTodos(snapshot);
    }
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

      {error && (
        <div className="border-t border-red-900/50 bg-red-950/30 px-4 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="border-t border-neutral-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Loading…
          </div>
        ) : (
          <TodoList
            todos={visibleTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
          />
        )}
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
