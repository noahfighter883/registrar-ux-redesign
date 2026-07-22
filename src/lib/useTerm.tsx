"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from "react";
import { TERMS } from "./departments";
import { Term } from "./types";

const STORAGE_KEY = "registrar.selectedTerm";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? TERMS[0].id;
}

function getServerSnapshot() {
  return TERMS[0].id;
}

type TermContextValue = {
  term: Term;
  termId: string;
  setTerm: (id: string) => void;
};

const TermContext = createContext<TermContextValue | null>(null);

export function TermProvider({ children }: { children: ReactNode }) {
  const termId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTerm = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    listeners.forEach((l) => l());
  }, []);

  const term = TERMS.find((t) => t.id === termId) ?? TERMS[0];

  return (
    <TermContext.Provider value={{ term, termId, setTerm }}>
      {children}
    </TermContext.Provider>
  );
}

export function useTerm() {
  const ctx = useContext(TermContext);
  if (!ctx) throw new Error("useTerm must be used within a TermProvider");
  return ctx;
}
