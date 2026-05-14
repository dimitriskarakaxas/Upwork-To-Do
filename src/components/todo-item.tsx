"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    onUpdate(todo.id, draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(todo.text);
    setEditing(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  return (
    <li className="group flex items-center gap-3 px-4 py-3 sm:px-6 transition hover:bg-neutral-900/40">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
          todo.completed
            ? "border-emerald-500 bg-emerald-500 text-black"
            : "border-neutral-600 hover:border-neutral-400"
        }`}
      >
        {todo.completed && (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm outline-none focus:border-neutral-500"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 cursor-text text-sm ${
            todo.completed
              ? "text-neutral-500 line-through"
              : "text-neutral-100"
          }`}
        >
          {todo.text}
        </span>
      )}

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete todo"
        className="opacity-0 transition group-hover:opacity-100 text-neutral-500 hover:text-red-400 focus:opacity-100"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.5 3a1 1 0 0 0-1 1v.5h-3a.75.75 0 0 0 0 1.5h.586l.71 9.234A2 2 0 0 0 7.79 17h4.42a2 2 0 0 0 1.994-1.766L14.914 6h.586a.75.75 0 0 0 0-1.5h-3V4a1 1 0 0 0-1-1h-3Zm.5 4.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6A.75.75 0 0 1 9 7.5Zm2.75.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}
