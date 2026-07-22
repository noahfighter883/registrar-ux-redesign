"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { TERMS } from "@/lib/departments";
import { useTerm } from "@/lib/useTerm";

export default function SiteHeader() {
  const pathname = usePathname();
  const { term, setTerm } = useTerm();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-line bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl italic text-ink">Registrar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navItem("/", "Dashboard")}
          {navItem("/search", "Find Classes")}
          {navItem("/schedule", "My Schedule")}
        </nav>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-4 py-1.5 text-sm font-mono font-medium text-ink hover:border-gold transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {term.label}
            <svg width="10" height="6" viewBox="0 0 10 6" className="opacity-60">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-line bg-card shadow-lg py-1 overflow-hidden">
              {TERMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTerm(t.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-paper transition-colors flex items-center justify-between ${
                    t.id === term.id ? "text-ink font-semibold" : "text-ink-soft"
                  }`}
                >
                  {t.label}
                  {t.isCurrent && (
                    <span className="text-[10px] uppercase tracking-wide text-open bg-open-soft rounded px-1.5 py-0.5 font-sans">
                      Open
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
