"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { INSTRUCTORS } from "@/lib/mockCourses";

export default function InstructorCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (instructor: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INSTRUCTORS;
    return INSTRUCTORS.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-line bg-card px-3.5 py-2.5 text-left text-sm text-ink hover:border-ink-soft/40 transition-colors"
      >
        <span className={value ? "text-ink" : "text-muted"}>
          {value || "Any professor"}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" className="opacity-50 shrink-0">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-line bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-line">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search professors…"
              className="w-full text-sm px-2.5 py-1.5 rounded-md bg-paper outline-none focus-visible:outline-2 focus-visible:outline-gold"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className="w-full text-left px-3.5 py-2 text-sm text-muted hover:bg-paper"
            >
              Any professor
            </button>
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full text-left px-3.5 py-2 text-sm hover:bg-paper ${
                  name === value ? "text-ink font-medium bg-gold-soft/40" : "text-ink-soft"
                }`}
              >
                {name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3.5 py-2 text-sm text-muted">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
