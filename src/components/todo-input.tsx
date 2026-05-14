"use client";

import { useState, type FormEvent } from "react";

type Props = {
  onAdd: (text: string) => void;
};

export function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-2 focus:ring-neutral-700/50"
        aria-label="New todo"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add
      </button>
    </form>
  );
}
