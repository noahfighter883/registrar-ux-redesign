"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_COURSES } from "@/lib/mockCourses";
import { useTerm } from "@/lib/useTerm";
import { useSchedule } from "@/lib/useSchedule";
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
  const { isAdded, addCourse, removeCourse } = useSchedule();
  const [page, setPage] = useState(1);
  const [openOnlyOverride, setOpenOnlyOverride] = useState(
    searchParams.get("openOnly") === "1"
  );
  const [sortKey, setSortKey] = useState<"course" | "credits" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const depts = (searchParams.get("dept") || "").split(",").filter(Boolean);
    const title = (searchParams.get("title") || "").toLowerCase();
    const instructors = (searchParams.get("instructor") || "").split("|").filter(Boolean);
    const courseMin = Number(searchParams.get("courseMin")) || 0;
    const courseMax = Number(searchParams.get("courseMax")) || 9999;
    const creditMin = Number(searchParams.get("creditMin")) || 0;
    const creditMax = Number(searchParams.get("creditMax")) || 99;

    return ALL_COURSES.filter((c) => {
      if (depts.length && !depts.includes(c.subject)) return false;
      if (title && !c.title.toLowerCase().includes(title)) return false;
      if (instructors.length && !instructors.includes(c.instructor)) return false;
      if (c.courseNumber < courseMin || c.courseNumber > courseMax) return false;
      if (c.credits < creditMin || c.credits > creditMax) return false;
      if (openOnlyOverride && c.seatsTaken >= c.seatsTotal) return false;
      return true;
    });
  }, [searchParams, openOnlyOverride]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "credits") return (a.credits - b.credits) * dir;
      const subjCompare = a.subject.localeCompare(b.subject);
      if (subjCompare !== 0) return subjCompare * dir;
      return (a.courseNumber - b.courseNumber) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: "course" | "credits") {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleAdd(crn: string) {
    if (isAdded(crn)) removeCourse(crn);
    else addCourse(crn);
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
                <Th sortDir={sortKey === "course" ? sortDir : undefined} onClick={() => toggleSort("course")}>
                  Course
                </Th>
                <Th>Title</Th>
                <Th>Instructor</Th>
                <Th>Meeting Times</Th>
                <Th sortDir={sortKey === "credits" ? sortDir : undefined} onClick={() => toggleSort("credits")}>
                  Credits
                </Th>
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
                    {isAdded(c.crn) ? (
                      <div className="flex flex-col items-stretch gap-1.5 w-36">
                        <Link
                          href="/schedule"
                          className="rounded-full bg-open text-white px-4 py-2 text-xs font-semibold text-center hover:bg-open/90 transition-colors"
                        >
                          View My Schedule
                        </Link>
                        <button
                          onClick={() => toggleAdd(c.crn)}
                          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-center leading-tight text-ink-soft hover:border-full/40 hover:text-full transition-colors"
                        >
                          Remove from My Schedule
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAdd(c.crn)}
                        disabled={c.seatsTaken >= c.seatsTotal}
                        className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                          c.seatsTaken >= c.seatsTotal
                            ? "bg-line text-muted cursor-not-allowed"
                            : "bg-ink text-paper hover:bg-gold"
                        }`}
                      >
                        Add to Schedule
                      </button>
                    )}
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

function Th({
  children,
  onClick,
  sortDir,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  sortDir?: "asc" | "desc";
}) {
  if (!onClick) {
    return (
      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
        {children}
      </th>
    );
  }

  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-1 transition-colors ${
          sortDir ? "text-ink" : "text-muted hover:text-ink"
        }`}
      >
        {children}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`transition-transform ${
            sortDir === "desc" ? "rotate-180" : ""
          } ${sortDir ? "opacity-100" : "opacity-30"}`}
        >
          <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
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
