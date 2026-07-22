"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "registrar.searchFilters";

export type SearchFilters = {
  depts: string[];
  subCode: string;
  title: string;
  instructors: string[];
  courseMin: string;
  courseMax: string;
  creditMin: string;
  creditMax: string;
  openOnly: boolean;
};

const DEFAULT_FILTERS: SearchFilters = {
  depts: [],
  subCode: "",
  title: "",
  instructors: [],
  courseMin: "",
  courseMax: "",
  creditMin: "",
  creditMax: "",
  openOnly: false,
};

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

let cachedRaw: string | null = null;
let cachedFilters: SearchFilters = DEFAULT_FILTERS;

function getSnapshot(): SearchFilters {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedFilters = raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS;
    } catch {
      cachedFilters = DEFAULT_FILTERS;
    }
  }
  return cachedFilters;
}

function getServerSnapshot(): SearchFilters {
  return DEFAULT_FILTERS;
}

function persist(next: SearchFilters) {
  cachedRaw = JSON.stringify(next);
  cachedFilters = next;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((l) => l());
}

export function useSearchFilters() {
  const filters = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setFilters = useCallback((patch: Partial<SearchFilters>) => {
    persist({ ...getSnapshot(), ...patch });
  }, []);

  const clearFilters = useCallback(() => persist(DEFAULT_FILTERS), []);

  return { filters, setFilters, clearFilters };
}
