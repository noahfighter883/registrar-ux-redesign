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
