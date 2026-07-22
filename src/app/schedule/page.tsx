"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_COURSES } from "@/lib/mockCourses";
import { useTerm } from "@/lib/useTerm";
import { useSchedule } from "@/lib/useSchedule";
import StatusBadge from "@/components/StatusBadge";
import { Course, withReservedSeat } from "@/lib/types";

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

export default function SchedulePage() {
  const { term } = useTerm();
  const { crns, removeCourse } = useSchedule();

  const courses = useMemo(() => {
    return ALL_COURSES.filter((c) => crns.has(c.crn)).sort((a, b) => {
      const subjCompare = a.subject.localeCompare(b.subject);
      if (subjCompare !== 0) return subjCompare;
      return a.courseNumber - b.courseNumber;
    });
  }, [crns]);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-1">
            {term.label}
          </p>
          <h1 className="font-display text-3xl text-ink">My Schedule</h1>
        </div>
        {courses.length > 0 && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-ink-soft">
              {courses.length} {courses.length === 1 ? "class" : "classes"} ·{" "}
              {totalCredits} {totalCredits === 1 ? "credit" : "credits"}
            </p>
            <Link
              href="/search"
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink-soft/40 transition-colors"
            >
              Find more classes
            </Link>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-12 text-center">
          <p className="text-ink-soft mb-6">
            You haven&apos;t added any classes to your schedule yet for {term.label}.
          </p>
          <Link
            href="/search"
            className="inline-block rounded-full bg-ink text-paper px-6 py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors"
          >
            Find classes
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-card overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
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
                {courses.map((c) => (
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
                      <StatusBadge course={withReservedSeat(c, true)} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => removeCourse(c.crn)}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold whitespace-nowrap text-ink-soft hover:border-full/40 hover:text-full transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
