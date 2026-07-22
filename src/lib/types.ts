export type MeetingTime = {
  days: ("Su" | "M" | "T" | "W" | "Th" | "F" | "Sa")[];
  start: string; // "10:10 AM"
  end: string; // "11:05 AM"
  building: string;
  room: string;
};

export type Course = {
  crn: string;
  subject: string; // e.g. "CS"
  courseNumber: number; // e.g. 206
  suffix?: string; // e.g. "C"
  section: string;
  title: string;
  department: string; // full department name
  instructor: string;
  credits: number;
  meetings: MeetingTime[];
  seatsTotal: number;
  seatsTaken: number;
  waitlistTotal: number;
  waitlistTaken: number;
};

export type Term = {
  id: string;
  label: string;
  isCurrent?: boolean;
};

// Your own "Add to Schedule" hold occupies a seat, so the count shown to
// you should reflect that even though the underlying mock data doesn't change.
export function withReservedSeat(course: Course, reserved: boolean): Course {
  if (!reserved || course.seatsTaken >= course.seatsTotal) return course;
  return { ...course, seatsTaken: course.seatsTaken + 1 };
}
