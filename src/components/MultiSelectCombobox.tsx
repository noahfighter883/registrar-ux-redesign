"use client";

import { useMemo, useRef, useState, useEffect } from "react";

export type ComboboxItem = { value: string; label: string };

export default function MultiSelectCombobox({
  items,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
}: {
  items: ComboboxItem[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
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
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  const selectedLabels = items.filter((i) => selected.includes(i.value));

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[46px] flex items-center justify-between gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-left text-sm text-ink hover:border-ink-soft/40 transition-colors"
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted">{placeholder}</span>
        ) : (
          <span className="flex flex-wrap gap-1.5 py-0.5">
            {selectedLabels.map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 rounded-full bg-gold-soft text-ink text-xs font-medium pl-2.5 pr-1.5 py-1"
              >
                {item.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(item.value);
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            ))}
          </span>
        )}
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
              placeholder={searchPlaceholder}
              className="w-full text-sm px-2.5 py-1.5 rounded-md bg-paper outline-none focus-visible:outline-2 focus-visible:outline-gold"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((item) => {
              const isSelected = selected.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggle(item.value)}
                  className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-sm hover:bg-paper ${
                    isSelected ? "text-ink font-medium" : "text-ink-soft"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-ink border-ink" : "border-line"
                    }`}
                  >
                    {isSelected && (
                      <svg width="9" height="7" viewBox="0 0 9 7" className="text-paper">
                        <path d="M1 3.5L3.2 5.7L8 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {item.label}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3.5 py-2 text-sm text-muted">No matches</p>
            )}
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left border-t border-line px-3.5 py-2.5 text-xs text-muted hover:text-ink hover:bg-paper transition-colors"
            >
              Clear all ({selected.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
