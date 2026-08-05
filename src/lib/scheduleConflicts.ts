import { Course, MeetingTime } from "./types";

export function parseMeetingMinutes(time: string) {
  const [clock, ampm] = time.split(" ");
  const [hStr, mStr] = clock.split(":");
  let h = Number(hStr);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + Number(mStr);
}

function meetingsOverlap(a: MeetingTime, b: MeetingTime) {
  const sharesDay = a.days.some((d) => b.days.includes(d));
  if (!sharesDay) return false;
  const aStart = parseMeetingMinutes(a.start);
  const aEnd = parseMeetingMinutes(a.end);
  const bStart = parseMeetingMinutes(b.start);
  const bEnd = parseMeetingMinutes(b.end);
  return aStart < bEnd && bStart < aEnd;
}

export function coursesConflict(a: Course, b: Course) {
  return a.meetings.some((ma) => b.meetings.some((mb) => meetingsOverlap(ma, mb)));
}

// Which of `existing` would create a schedule conflict if `candidate` were added.
export function findConflicts(candidate: Course, existing: Course[]) {
  return existing.filter((c) => c.crn !== candidate.crn && coursesConflict(candidate, c));
}
