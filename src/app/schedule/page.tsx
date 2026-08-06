"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_COURSES } from "@/lib/mockCourses";
import { useTerm } from "@/lib/useTerm";
import { useSchedule } from "@/lib/useSchedule";
import { Course, MeetingTime } from "@/lib/types";
import { coursesConflict, parseMeetingMinutes } from "@/lib/scheduleConflicts";

const DAY_LABELS: Record<string, string> = {
  Su: "Sunday",
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  Sa: "Saturday",
};

const CALENDAR_DAYS: MeetingDay[] = ["M", "T", "W", "Th", "F"];
type MeetingDay = Course["meetings"][number]["days"][number];

// Soft pastel background + saturated text, in the same style as the
// app's existing open/full/wait status tokens — assigned per course so
// every meeting block for a course reads as one color at a glance.
const COURSE_COLORS = [
  { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe" },
  { bg: "#fef3e2", text: "#92400e", border: "#fde3b8" },
  { bg: "#e6f4ea", text: "#1e5631", border: "#bfe3cb" },
  { bg: "#fde8e8", text: "#9b2c2c", border: "#f7c6c6" },
  { bg: "#f3e8ff", text: "#6b21a8", border: "#e2c9fb" },
  { bg: "#e0f2fe", text: "#075985", border: "#bae6fd" },
  { bg: "#fce7f3", text: "#9d174d", border: "#fbcfe8" },
];

// Keyed by CRN (not list position), so a course's color stays the same
// even after other courses are added or dropped.
function courseColor(crn: string) {
  let hash = 0;
  for (let i = 0; i < crn.length; i++) hash = (hash * 31 + crn.charCodeAt(i)) >>> 0;
  return COURSE_COLORS[hash % COURSE_COLORS.length];
}

function courseCode(c: Course) {
  return `${c.subject} ${c.courseNumber}${c.suffix ?? ""}`;
}

function formatDayTimeLines(c: Course) {
  return c.meetings.map((m) => `${m.days.map((d) => DAY_LABELS[d]).join("/")} ${m.start}–${m.end}`);
}

const GRID_START = 7 * 60;
const GRID_END = 19 * 60;
const PX_PER_MIN = 1.1;
const GRID_HEIGHT = (GRID_END - GRID_START) * PX_PER_MIN;

function formatHourLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${ampm}`;
}

type CalendarBlock = {
  key: string;
  crn: string;
  top: number;
  height: number;
  code: string;
  section: string;
  timeLabel: string;
  color: (typeof COURSE_COLORS)[number];
  course: Course;
  meeting: MeetingTime;
};

type LaidOutBlock = CalendarBlock & {
  columns: number;
  colIndex: number;
  conflict: boolean;
};

// Standard calendar collision layout: sweep blocks in start order, packing
// each into the first column whose previous block has already ended.
// Overlapping blocks share a "cluster" and split that cluster's width evenly.
function layoutBlocks(blocks: CalendarBlock[]): LaidOutBlock[] {
  const sorted = [...blocks].sort((a, b) => a.top - b.top);
  const results: LaidOutBlock[] = [];
  let cluster: { block: CalendarBlock; col: number }[] = [];
  let colEnds: number[] = [];

  function flush() {
    if (!cluster.length) return;
    const columns = Math.max(...cluster.map((c) => c.col)) + 1;
    cluster.forEach(({ block, col }) => {
      results.push({ ...block, columns, colIndex: col, conflict: columns > 1 });
    });
    cluster = [];
    colEnds = [];
  }

  sorted.forEach((block) => {
    const clusterActive = colEnds.some((end) => end > block.top);
    if (!clusterActive && cluster.length > 0) flush();

    let colIndex = colEnds.findIndex((end) => end <= block.top);
    if (colIndex === -1) {
      colIndex = colEnds.length;
      colEnds.push(block.top + block.height);
    } else {
      colEnds[colIndex] = block.top + block.height;
    }
    cluster.push({ block, col: colIndex });
  });
  flush();

  return results;
}

export default function SchedulePage() {
  const { term } = useTerm();
  const { crns, removeCourse, addCourse } = useSchedule();
  const [lastDropped, setLastDropped] = useState<Course | null>(null);
  const [toastDismissing, setToastDismissing] = useState(false);
  const [dropId, setDropId] = useState(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [blockTooltip, setBlockTooltip] = useState<{
    block: LaidOutBlock;
    left: number;
    top: number;
    placement: "above" | "below";
    conflict: boolean;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  function showBlockTooltip(block: LaidOutBlock, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const spaceAbove = rect.top;
    const placement: "above" | "below" = spaceAbove > 180 ? "above" : "below";
    setBlockTooltip({
      block,
      left: Math.min(Math.max(rect.left + rect.width / 2, 132), window.innerWidth - 132),
      top: placement === "above" ? rect.top - 8 : rect.bottom + 8,
      placement,
      conflict: block.conflict,
    });
  }

  function hideBlockTooltip() {
    setBlockTooltip(null);
  }

  // The tooltip's position is computed once, from the block's screen
  // rect at hover/focus time. If the page (or the calendar's own
  // horizontal scroll) moves after that without the pointer actually
  // leaving the block, the fixed-position tooltip would go stale and
  // drift away from the block it describes — so drop it on any scroll.
  useEffect(() => {
    if (!blockTooltip) return;
    function onScroll() {
      setBlockTooltip(null);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [blockTooltip]);

  function beginToastDismiss() {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setToastDismissing(true);
    leaveTimer.current = setTimeout(() => {
      setLastDropped(null);
      setToastDismissing(false);
    }, 160);
  }

  const courses = useMemo(() => {
    return ALL_COURSES.filter((c) => crns.has(c.crn)).sort((a, b) => {
      const subjCompare = a.subject.localeCompare(b.subject);
      if (subjCompare !== 0) return subjCompare;
      return a.courseNumber - b.courseNumber;
    });
  }, [crns]);

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  function handleDrop(crn: string) {
    const course = courses.find((c) => c.crn === crn) ?? null;
    removeCourse(crn);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setToastDismissing(false);
    setLastDropped(course);
    setDropId((id) => id + 1);
    if (course) {
      undoTimer.current = setTimeout(beginToastDismiss, 6000);
    }
  }

  function handleUndoDrop() {
    if (!lastDropped) return;
    addCourse(lastDropped.crn);
    beginToastDismiss();
  }

  const blocksByDay = useMemo(() => {
    const rawByDay = new Map<MeetingDay, CalendarBlock[]>(CALENDAR_DAYS.map((d) => [d, []]));
    courses.forEach((course) => {
      const color = courseColor(course.crn);
      course.meetings.forEach((m, mi) => {
        const start = parseMeetingMinutes(m.start);
        const end = parseMeetingMinutes(m.end);
        m.days.forEach((day) => {
          const bucket = rawByDay.get(day as MeetingDay);
          if (!bucket) return;
          bucket.push({
            key: `${course.crn}-${mi}-${day}`,
            crn: course.crn,
            top: (start - GRID_START) * PX_PER_MIN,
            height: (end - start) * PX_PER_MIN,
            code: courseCode(course),
            section: course.section,
            timeLabel: `${m.start}–${m.end}`,
            color,
            course,
            meeting: m,
          });
        });
      });
    });

    const laidOutByDay = new Map<MeetingDay, LaidOutBlock[]>();
    rawByDay.forEach((blocks, day) => {
      laidOutByDay.set(day, layoutBlocks(blocks));
    });

    return laidOutByDay;
  }, [courses]);

  // Ground truth for "which courses conflict with which" — independent of
  // the calendar's column-splitting layout, so the banner can name exact
  // pairs and offer a resolution action for each.
  const conflictPairs = useMemo(() => {
    const pairs: { a: Course; b: Course }[] = [];
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        if (coursesConflict(courses[i], courses[j])) {
          pairs.push({ a: courses[i], b: courses[j] });
        }
      }
    }
    return pairs;
  }, [courses]);

  const conflictCrns = useMemo(
    () => new Set(conflictPairs.flatMap((p) => [p.a.crn, p.b.crn])),
    [conflictPairs]
  );

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = GRID_START; m <= GRID_END; m += 60) marks.push(m);
    return marks;
  }, []);

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
              href="/results"
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
        <>
          {conflictPairs.length > 0 && (
            <div className="menu-enter rounded-xl bg-wait-soft border border-wait/20 px-4 py-3 mb-6 space-y-2.5">
              <p className="flex items-center gap-2 text-wait text-sm font-medium">
                <span aria-hidden>⚠</span>
                {conflictPairs.length === 1
                  ? "1 time conflict in your schedule."
                  : `${conflictPairs.length} time conflicts in your schedule.`}
              </p>
              <ul className="space-y-2">
                {conflictPairs.map((pair) => (
                  <li
                    key={`${pair.a.crn}-${pair.b.crn}`}
                    className="flex flex-wrap items-center gap-2.5 text-sm text-ink-soft bg-card/70 rounded-lg px-3 py-2.5"
                  >
                    <span>
                      <strong className="text-ink">{courseCode(pair.a)}</strong> and{" "}
                      <strong className="text-ink">{courseCode(pair.b)}</strong> meet at the same time.
                    </span>
                    <span className="flex gap-1.5 sm:ml-auto">
                      <button
                        onClick={() => handleDrop(pair.a.crn)}
                        className="rounded-full border border-wait/40 px-3 py-1 text-xs font-semibold text-wait hover:bg-wait/10 transition-colors whitespace-nowrap"
                      >
                        Drop {courseCode(pair.a)}
                      </button>
                      <button
                        onClick={() => handleDrop(pair.b.crn)}
                        className="rounded-full border border-wait/40 px-3 py-1 text-xs font-semibold text-wait hover:bg-wait/10 transition-colors whitespace-nowrap"
                      >
                        Drop {courseCode(pair.b)}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-card overflow-hidden">
            <div className="hidden md:block overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper border-b border-line">
                    <Th>Course</Th>
                    <Th>Credits</Th>
                    <Th>CRN</Th>
                    <Th>Section</Th>
                    <Th>Course Name</Th>
                    <Th>Day(s) &amp; Time</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const color = courseColor(c.crn);
                    const hasConflict = conflictCrns.has(c.crn);
                    return (
                      <tr key={c.crn} className="border-b border-line last:border-0 hover:bg-paper/60 align-top">
                        <td className="px-4 py-4">
                          <span
                            className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-ink"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: color.text }}
                            />
                            {courseCode(c)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-ink-soft">{c.credits}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs text-muted whitespace-nowrap">{c.crn}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs text-muted">{c.section}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-ink font-medium max-w-[220px]">{c.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-ink-soft max-w-[190px] space-y-0.5">
                            {formatDayTimeLines(c).map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="inline-flex items-center rounded-full bg-open-soft text-open text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                              Enrolled
                            </span>
                            {hasConflict && (
                              <span className="conflict-pop inline-flex items-center gap-1 rounded-full bg-wait-soft text-wait text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                                <span aria-hidden>⚠</span> Time Conflict
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDrop(c.crn)}
                            className="rounded-full border border-line px-4 py-2 text-xs font-semibold whitespace-nowrap text-ink-soft hover:border-full/40 hover:text-full transition-colors"
                          >
                            Drop
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-line">
              {courses.map((c) => {
                const color = courseColor(c.crn);
                const hasConflict = conflictCrns.has(c.crn);
                return (
                  <div key={c.crn} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-ink">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color.text }} />
                        {courseCode(c)}
                      </span>
                      <span className="text-xs text-muted font-mono whitespace-nowrap">{c.credits} cr</span>
                    </div>
                    <p className="text-sm text-ink font-medium mb-1">{c.title}</p>
                    <p className="font-mono text-xs text-muted mb-2">
                      Sec {c.section} · CRN {c.crn}
                    </p>
                    <div className="text-sm text-ink-soft space-y-0.5 mb-3">
                      {formatDayTimeLines(c).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-open-soft text-open text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                          Enrolled
                        </span>
                        {hasConflict && (
                          <span className="conflict-pop inline-flex items-center gap-1 rounded-full bg-wait-soft text-wait text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                            <span aria-hidden>⚠</span> Time Conflict
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDrop(c.crn)}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold whitespace-nowrap text-ink-soft hover:border-full/40 hover:text-full transition-colors shrink-0"
                      >
                        Drop
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <div style={{ minWidth: 720 }}>
                <div
                  className="grid border-b border-line"
                  style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}
                >
                  <div />
                  {CALENDAR_DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold uppercase tracking-wide text-muted py-2.5 border-l border-line"
                    >
                      {DAY_LABELS[day]}
                    </div>
                  ))}
                </div>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "56px repeat(5, 1fr)" }}
                >
                  <div className="relative" style={{ height: GRID_HEIGHT }}>
                    {hourMarks.map((m) => (
                      <div
                        key={m}
                        className="absolute right-2 text-[10px] text-muted font-mono -translate-y-1/2"
                        style={{ top: (m - GRID_START) * PX_PER_MIN }}
                      >
                        {formatHourLabel(m)}
                      </div>
                    ))}
                  </div>
                  {CALENDAR_DAYS.map((day) => (
                    <div key={day} className="relative border-l border-line" style={{ height: GRID_HEIGHT }}>
                      {hourMarks.map((m) => (
                        <div
                          key={m}
                          className="absolute left-0 right-0 border-t border-line/70"
                          style={{ top: (m - GRID_START) * PX_PER_MIN }}
                        />
                      ))}
                      {blocksByDay.get(day)?.map((block) => (
                        <div
                          key={block.key}
                          tabIndex={0}
                          role="button"
                          aria-label={`${block.code} section ${block.section}, ${block.course.title}, taught by ${block.course.instructor}, ${block.timeLabel}, ${block.meeting.building} ${block.meeting.room}, ${block.course.credits} credits${
                            block.conflict ? ", time conflict" : ""
                          }`}
                          onMouseEnter={(e) => showBlockTooltip(block, e.currentTarget)}
                          onMouseLeave={hideBlockTooltip}
                          onFocus={(e) => showBlockTooltip(block, e.currentTarget)}
                          onBlur={hideBlockTooltip}
                          className="absolute rounded-lg px-2 py-1 overflow-hidden cursor-default"
                          style={{
                            top: block.top,
                            height: Math.max(block.height, 24),
                            left: `calc(${(block.colIndex / block.columns) * 100}% + 2px)`,
                            width: `calc(${100 / block.columns}% - 4px)`,
                            background: block.color.bg,
                            border: block.conflict
                              ? "1.5px dashed var(--wait)"
                              : `1px solid ${block.color.border}`,
                            color: block.color.text,
                          }}
                        >
                          {block.conflict && (
                            <p className="conflict-pop text-[9px] font-bold uppercase tracking-wide text-wait leading-tight">
                              ⚠ Conflict
                            </p>
                          )}
                          <p className="text-[11px] font-semibold leading-tight truncate">
                            {block.code} ({block.section})
                          </p>
                          <p className="text-[10px] leading-tight opacity-80 truncate">
                            {block.timeLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {blockTooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: blockTooltip.left,
            top: blockTooltip.top,
            transform: `translate(-50%, ${blockTooltip.placement === "above" ? "-100%" : "0"})`,
          }}
        >
          <div
            role="tooltip"
            className="tooltip-pop w-64 rounded-xl border border-line bg-ink text-paper px-4 py-3 shadow-lg"
            style={{ transformOrigin: blockTooltip.placement === "above" ? "bottom center" : "top center" }}
          >
            <p className="font-mono text-xs uppercase tracking-wide text-paper/60 mb-1">
              {blockTooltip.block.code} · Sec {blockTooltip.block.section}
              {blockTooltip.conflict && <span className="text-wait"> · Conflict</span>}
            </p>
            <p className="font-display text-base leading-snug mb-2">{blockTooltip.block.course.title}</p>
            <dl className="space-y-1 text-sm text-paper/85">
              <div className="flex justify-between gap-4">
                <dt className="text-paper/55">Instructor</dt>
                <dd className="text-right">{blockTooltip.block.course.instructor}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/55">Time</dt>
                <dd className="text-right">{blockTooltip.block.timeLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/55">Location</dt>
                <dd className="text-right">
                  {blockTooltip.block.meeting.building} {blockTooltip.block.meeting.room}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/55">Credits</dt>
                <dd className="text-right">{blockTooltip.block.course.credits}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper/55">CRN</dt>
                <dd className="text-right font-mono">{blockTooltip.block.crn}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {lastDropped && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 overflow-hidden rounded-full border border-line bg-ink text-paper shadow-lg ${
            toastDismissing ? "toast-leave" : "menu-enter"
          }`}
        >
          <div className="flex items-center gap-3 pl-4 pr-2 py-2">
            <span className="text-sm whitespace-nowrap">Dropped {courseCode(lastDropped)}</span>
            <button
              onClick={handleUndoDrop}
              className="rounded-full bg-paper/15 hover:bg-paper/25 px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Undo
            </button>
          </div>
          <div className="h-0.5 bg-paper/15">
            <div key={dropId} className="toast-countdown-bar h-full bg-gold" />
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
