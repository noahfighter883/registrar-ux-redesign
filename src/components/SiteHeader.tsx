"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { TERMS } from "@/lib/departments";
import { useTerm } from "@/lib/useTerm";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Find Classes" },
  { href: "/schedule", label: "My Schedule" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { term, setTerm } = useTerm();
  const [termOpen, setTermOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (termRef.current && !termRef.current.contains(target)) setTermOpen(false);
      const clickedNavButton = navButtonRef.current?.contains(target);
      if (navRef.current && !navRef.current.contains(target) && !clickedNavButton) {
        setNavOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setTermOpen(false);
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navItem = (href: string, label: string, onClick?: () => void) => (
    <Link
      key={href}
      href={href}
      onClick={onClick}
      aria-current={pathname === href ? "page" : undefined}
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
        <div className="flex items-center gap-3 shrink-0">
          <button
            ref={navButtonRef}
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center w-9 h-9 -ml-1.5 rounded-lg text-ink-soft hover:bg-paper transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {navOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <Link href="/" onClick={() => setNavOpen(false)} className="flex items-center gap-2">
            <span className="font-display text-xl italic text-ink">Registrar</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map((l) => navItem(l.href, l.label))}
        </nav>

        <div className="relative" ref={termRef}>
          <button
            onClick={() => setTermOpen((o) => !o)}
            aria-expanded={termOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-4 py-1.5 text-sm font-mono font-medium text-ink hover:border-gold transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {term.label}
            <svg width="10" height="6" viewBox="0 0 10 6" className="opacity-60">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          {termOpen && (
            <div
              role="listbox"
              aria-label="Term"
              className="menu-enter absolute right-0 mt-2 w-56 rounded-lg border border-line bg-card shadow-lg py-1 overflow-hidden"
            >
              {TERMS.map((t) => (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={t.id === term.id}
                  onClick={() => {
                    setTerm(t.id);
                    setTermOpen(false);
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

      {navOpen && (
        <nav
          id="mobile-nav"
          ref={navRef}
          className="menu-enter md:hidden border-t border-line px-6 py-3 flex flex-col gap-3 bg-card"
        >
          {NAV_LINKS.map((l) => navItem(l.href, l.label, () => setNavOpen(false)))}
        </nav>
      )}
    </header>
  );
}
