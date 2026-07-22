"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ALL_COURSES } from "@/lib/mockCourses";
import { useTerm } from "@/lib/useTerm";
import { useSchedule } from "@/lib/useSchedule";
import { Course } from "@/lib/types";

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

function courseCode(c: Course) {
  return `${c.subject} ${c.courseNumber}${c.suffix ?? ""}`;
}

function formatDayTime(c: Course) {
  return c.meetings
    .map((m) => `${m.days.map((d) => DAY_LABELS[d]).join("/")} ${m.start}–${m.end}`)
    .join("; ");
}

function parseMinutes(time: string) {
  const [clock, ampm] = time.split(" ");
  const [hStr, mStr] = clock.split(":");
  let h = Number(hStr);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + Number(mStr);
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
  day: MeetingDay;
  top: number;
  height: number;
  code: string;
  section: string;
  timeLabel: string;
  color: (typeof COURSE_COLORS)[number];
};

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

  const blocksByDay = useMemo(() => {
    const map = new Map<MeetingDay, CalendarBlock[]>(CALENDAR_DAYS.map((d) => [d, []]));
    courses.forEach((course, i) => {
      const color = COURSE_COLORS[i % COURSE_COLORS.length];
      course.meetings.forEach((m, mi) => {
        const start = parseMinutes(m.start);
        const end = parseMinutes(m.end);
        m.days.forEach((day) => {
          const bucket = map.get(day as MeetingDay);
          if (!bucket) return;
          bucket.push({
            key: `${course.crn}-${mi}-${day}`,
            day: day as MeetingDay,
            top: (start - GRID_START) * PX_PER_MIN,
            height: (end - start) * PX_PER_MIN,
            code: courseCode(course),
            section: course.section,
            timeLabel: `${m.start}–${m.end}`,
            color,
          });
        });
      });
    });
    return map;
  }, [courses]);

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
        <>
          <div className="rounded-2xl border border-line bg-card overflow-hidden">
            <div className="overflow-auto">
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
                  {courses.map((c, i) => {
                    const color = COURSE_COLORS[i % COURSE_COLORS.length];
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
                          <p className="text-sm text-ink-soft whitespace-nowrap">{formatDayTime(c)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full bg-open-soft text-open text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                            Enrolled
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <Link
                              href="/search"
                              className="text-xs font-semibold text-gold hover:underline"
                            >
                              Swap
                            </Link>
                            <button
                              onClick={() => removeCourse(c.crn)}
                              className="text-xs font-semibold text-full hover:underline"
                            >
                              Drop
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                          className="absolute left-1 right-1 rounded-lg px-2 py-1 overflow-hidden"
                          style={{
                            top: block.top,
                            height: Math.max(block.height, 24),
                            background: block.color.bg,
                            border: `1px solid ${block.color.border}`,
                            color: block.color.text,
                          }}
                        >
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
