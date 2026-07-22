"use client";

import { useMemo, useRef, useState, useEffect, useId } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

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

  function closeAndRefocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const active = filtered[activeIndex];
      if (active) toggle(active.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAndRefocus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setActiveIndex(0);
        }}
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
                  aria-label={`Remove ${item.label}`}
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
        <div className="menu-enter absolute z-20 mt-1.5 w-full rounded-lg border border-line bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-line">
            <input
              ref={inputRef}
              autoFocus
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={searchPlaceholder}
              className="w-full text-sm px-2.5 py-1.5 rounded-md bg-paper outline-none focus-visible:outline-2 focus-visible:outline-gold"
            />
          </div>
          <div id={listId} role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto py-1">
            {filtered.map((item, i) => {
              const isSelected = selected.includes(item.value);
              const isActive = i === activeIndex;
              return (
                <button
                  key={item.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => toggle(item.value)}
                  className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-sm ${
                    isActive ? "bg-paper" : ""
                  } ${isSelected ? "text-ink font-medium" : "text-ink-soft"}`}
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
