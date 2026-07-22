"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, ReactNode } from "react";

const STORAGE_KEY = "registrar.schedule";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function readStored(): string[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore requires a stable snapshot reference; cache the
// parsed value and only reparse when the underlying storage actually changes.
let cachedRaw: string | null = null;
let cachedCrns: string[] = [];

function getSnapshot(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedCrns = readStored();
  }
  return cachedCrns;
}

const EMPTY_CRNS: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY_CRNS;
}

function persist(next: string[]) {
  cachedRaw = JSON.stringify(next);
  cachedCrns = next;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((l) => l());
}

type ScheduleContextValue = {
  crns: Set<string>;
  addCourse: (crn: string) => void;
  removeCourse: (crn: string) => void;
  isAdded: (crn: string) => boolean;
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const crnList = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const crns = useMemo(() => new Set(crnList), [crnList]);

  const addCourse = useCallback((crn: string) => {
    if (crns.has(crn)) return;
    persist([...crnList, crn]);
  }, [crnList, crns]);

  const removeCourse = useCallback((crn: string) => {
    persist(crnList.filter((c) => c !== crn));
  }, [crnList]);

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
