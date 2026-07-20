"use client";

import { useState } from "react";
import { TERMS } from "./departments";

const STORAGE_KEY = "registrar.selectedTerm";

export function useTerm() {
  const [termId, setTermId] = useState<string>(() => {
    if (typeof window === "undefined") return TERMS[0].id;
    return window.localStorage.getItem(STORAGE_KEY) ?? TERMS[0].id;
  });

  const setTerm = (id: string) => {
    setTermId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const term = TERMS.find((t) => t.id === termId) ?? TERMS[0];

  return { term, termId, setTerm };
}
