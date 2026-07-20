"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_COURSES } from "@/lib/mockCourses";
import { useTerm } from "@/lib/useTerm";
import StatusBadge from "@/components/StatusBadge";
import { Course } from "@/lib/types";

const PAGE_SIZE = 15;

function formatMeeting(course: Course) {
  return course.meetings.map((m, i) => (
    <div key={i} className="flex items-baseline gap-2 text-sm">
      <span className="font-mono text-xs text-ink-soft tracking-tight shrink-0">
        {m.days.join("")}
      </span>
      <span className="text-ink-soft whitespace-nowrap">
        {m.start}–{m.end}
      </span>
      <span className="text-muted text-xs whitespace-nowrap">
        {m.building} {m.room}
      </span>
    </div>
  ));
}

function ResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { term } = useTerm();
  const [page, setPage] = useState(1);
  const [openOnlyOverride, setOpenOnlyOverride] = useState(
    searchParams.get("openOnly") === "1"
  );
  const [added, setAdded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const dept = searchParams.get("dept") || "";
    const title = (searchParams.get("title") || "").toLowerCase();
    const courseMin = Number(searchParams.get("courseMin")) || 0;
    const courseMax = Number(searchParams.get("courseMax")) || 9999;
    const creditMin = Number(searchParams.get("creditMin")) || 0;
    const creditMax = Number(searchParams.get("creditMax")) || 99;

    return ALL_COURSES.filter((c) => {
      if (dept && c.subject !== dept) return false;
      if (title && !c.title.toLowerCase().includes(title)) return false;
      if (c.courseNumber < courseMin || c.courseNumber > courseMax) return false;
      if (c.credits < creditMin || c.credits > creditMax) return false;
      if (openOnlyOverride && c.seatsTaken >= c.seatsTotal) return false;
      return true;
    });
  }, [searchParams, openOnlyOverride]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleAdd(crn: string) {
    setAdded((prev) => {
      const next = new Set(prev);
      if (next.has(crn)) next.delete(crn);
      else next.add(crn);
      return next;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-1">
            {term.label}
          </p>
          <h1 className="font-display text-3xl text-ink">
            {filtered.length} {filtered.length === 1 ? "class" : "classes"} found
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={openOnlyOverride}
              onClick={() => {
                setOpenOnlyOverride((o) => !o);
                setPage(1);
              }}
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                openOnlyOverride ? "bg-open" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  openOnlyOverride ? "translate-x-4" : ""
                }`}
              />
            </button>
            Available seats only
          </label>
          <button
            onClick={() => router.push("/search")}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink-soft/40 transition-colors"
          >
            Refine search
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-card overflow-hidden">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-paper border-b border-line shadow-[0_1px_0_0_var(--line)]">
                <Th>Course</Th>
                <Th>Title</Th>
                <Th>Instructor</Th>
                <Th>Meeting Times</Th>
                <Th>Credits</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c.crn} className="border-b border-line last:border-0 hover:bg-paper/60 align-top">
                  <td className="px-4 py-4">
                    <p className="font-mono text-sm font-semibold text-ink">
                      {c.subject} {c.courseNumber}
                    </p>
                    <p className="font-mono text-xs text-muted">
                      Sec {c.section} · CRN {c.crn}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-ink font-medium max-w-[220px]">{c.title}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-ink-soft whitespace-nowrap">{c.instructor}</p>
                  </td>
                  <td className="px-4 py-4 space-y-1">{formatMeeting(c)}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-ink-soft">{c.credits}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge course={c} />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleAdd(c.crn)}
                      disabled={c.seatsTaken >= c.seatsTotal && !added.has(c.crn)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                        added.has(c.crn)
                          ? "bg-open text-white"
                          : c.seatsTaken >= c.seatsTotal
                          ? "bg-line text-muted cursor-not-allowed"
                          : "bg-ink text-paper hover:bg-gold"
                      }`}
                    >
                      {added.has(c.crn) ? "Added ✓" : "Add to Schedule"}
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted">
                    No classes match your filters. Try widening your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-paper">
            <p className="text-xs text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-line w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30 hover:border-ink-soft/40"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-line w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30 hover:border-ink-soft/40"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
      {children}
    </th>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-10 text-muted">Loading…</div>}>
      <ResultsInner />
    </Suspense>
  );
}
