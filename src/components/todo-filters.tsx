"use client";

import type { Filter } from "@/lib/types";

type Props = {
  filter: Filter;
  onChange: (filter: Filter) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
};

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoFilters({
  filter,
  onChange,
  activeCount,
  completedCount,
  onClearCompleted,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-400">
      <span>
        {activeCount} {activeCount === 1 ? "item" : "items"} left
      </span>

      <div className="flex items-center gap-1">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={`rounded-md px-2.5 py-1 transition ${
              filter === f.value
                ? "bg-neutral-800 text-neutral-100"
                : "hover:bg-neutral-900 hover:text-neutral-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={completedCount === 0}
        className="text-left sm:text-right transition hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-neutral-400"
      >
        Clear completed
      </button>
    </div>
  );
}
