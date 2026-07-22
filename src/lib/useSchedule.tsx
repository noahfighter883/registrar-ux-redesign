"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, ReactNode } from "react";
import { useTerm } from "./useTerm";

const STORAGE_KEY = "registrar.schedule";

// Keyed by term id, so each term keeps its own set of added courses.
type ScheduleStore = Record<string, string[]>;

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function readStored(): ScheduleStore {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// useSyncExternalStore requires a stable snapshot reference; cache the
// parsed value and only reparse when the underlying storage actually changes.
let cachedRaw: string | null = null;
let cachedStore: ScheduleStore = {};

function getSnapshot(): ScheduleStore {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedStore = readStored();
  }
  return cachedStore;
}

const EMPTY_STORE: ScheduleStore = {};

function getServerSnapshot(): ScheduleStore {
  return EMPTY_STORE;
}

function persist(next: ScheduleStore) {
  cachedRaw = JSON.stringify(next);
  cachedStore = next;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((l) => l());
}

const EMPTY_CRNS: string[] = [];

type ScheduleContextValue = {
  crns: Set<string>;
  addCourse: (crn: string) => void;
  removeCourse: (crn: string) => void;
  isAdded: (crn: string) => boolean;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { termId } = useTerm();
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const crnList = store[termId] ?? EMPTY_CRNS;
  const crns = useMemo(() => new Set(crnList), [crnList]);

  const addCourse = useCallback((crn: string) => {
    const current = getSnapshot();
    const currentList = current[termId] ?? EMPTY_CRNS;
    if (currentList.includes(crn)) return;
    persist({ ...current, [termId]: [...currentList, crn] });
  }, [termId]);

  const removeCourse = useCallback((crn: string) => {
    const current = getSnapshot();
    const currentList = current[termId] ?? EMPTY_CRNS;
    persist({ ...current, [termId]: currentList.filter((c) => c !== crn) });
  }, [termId]);

  const isAdded = useCallback((crn: string) => crns.has(crn), [crns]);

  return (
    <ScheduleContext.Provider value={{ crns, addCourse, removeCourse, isAdded }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
  return ctx;
}
