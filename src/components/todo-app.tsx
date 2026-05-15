"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Filter, Todo } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { TodoInput } from "./todo-input";
import { TodoList } from "./todo-list";
import { TodoFilters } from "./todo-filters";

export function TodoApp() {
  const supabase = useMemo(() => createClient(), []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }
    setTodos((data ?? []) as Todo[]);
    setError(null);
  }, [supabase]);

  useEffect(() => {
    loadTodos().finally(() => setLoading(false));
  }, [loadTodos]);

  const addTodo = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ text: trimmed, completed: false })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }
    setTodos((prev) => [data as Todo, ...prev]);
  };

  const toggleTodo = async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    const { error } = await supabase
      .from("todos")
      .update({ completed: !current.completed })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t))
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      setError(error.message);
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

    const { error } = await supabase
      .from("todos")
      .update({ text: trimmed })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setTodos(snapshot);
    }
  };

  const clearCompleted = async () => {
    const snapshot = todos;
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) return;

    setTodos((prev) => prev.filter((t) => !t.completed));

    const { error } = await supabase
      .from("todos")
      .delete()
      .in("id", completedIds);

    if (error) {
      setError(error.message);
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
