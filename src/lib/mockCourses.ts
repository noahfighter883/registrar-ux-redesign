import { DEPARTMENTS } from "./departments";
import { Course, MeetingTime } from "./types";

const TITLES: Record<string, string[]> = {
  AM: ["Intro to American Studies", "Race & Media in America", "The American City"],
  AN: ["Cultural Anthropology", "Human Origins", "Anthropology of Food"],
  AR: ["Drawing I", "Sculpture Studio", "Digital Photography"],
  AH: ["Survey of Western Art", "Museum Studies", "Art of the Renaissance"],
  BI: ["Principles of Biology", "Genetics", "Ecology & Evolution"],
  MB: ["Financial Accounting", "Marketing Principles", "Organizational Behavior"],
  CH: ["Principles of Chemistry", "Organic Chemistry I", "Biochemistry"],
  CS: ["Intro to Programming", "Data Structures", "Human-Computer Interaction", "Databases"],
  DN: ["Beginning Ballet", "Modern Dance Technique", "Choreographic Practices"],
  EC: ["Microeconomics", "Macroeconomics", "Behavioral Economics"],
  EN: ["Creative Writing", "Shakespeare", "20th Century American Fiction"],
  ES: ["Intro to Environmental Studies", "Climate & Society", "Field Ecology"],
  MA: ["Calculus I", "Linear Algebra", "Discrete Mathematics"],
  MU: ["Music Theory I", "History of Jazz", "Applied Piano"],
  PH: ["Intro to Philosophy", "Ethics", "Philosophy of Mind"],
  PS: ["General Physics I", "Modern Physics", "Astrophysics"],
  PY: ["Intro to Psychology", "Cognitive Psychology", "Abnormal Psychology"],
  WL: ["Elementary French I", "Intermediate Spanish", "German Culture & Film", "Elementary Japanese I"],
};

export const INSTRUCTORS = [
  "Kleinsmith, Abigail", "Sweeney, Sarah", "Tamagawa, Masami", "Lander, Maria",
  "Knight-Mosby, Dorothy", "Matheron, Aurelie", "Schebetta, Dennis", "Brueggemann, John",
  "Possidente, Bernard", "Raththagala, Madushi", "Kennerly, Will", "Roca, Maryuri",
  "Chen, Wei", "Okafor, Ade", "Nguyen, Thi", "Patel, Ravi",
].sort();

const BUILDINGS = ["Tisch", "Palamountain", "Harder", "Dana", "Ladd", "Bolton"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildMeeting(rand: () => number): MeetingTime {
  const patterns: MeetingTime["days"][] = [
    ["M", "W"],
    ["T", "Th"],
    ["M", "W", "F"],
    ["T"],
    ["W"],
  ];
  const startHour = 8 + Math.floor(rand() * 9);
  const startMin = rand() > 0.5 ? "00" : "30";
  const durationMin = 50 + Math.floor(rand() * 3) * 25;
  const totalStart = startHour * 60 + (startMin === "30" ? 30 : 0);
  const totalEnd = totalStart + durationMin;
  const fmt = (mins: number) => {
    let h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  };
  return {
    days: patterns[Math.floor(rand() * patterns.length)],
    start: fmt(totalStart),
    end: fmt(totalEnd),
    building: BUILDINGS[Math.floor(rand() * BUILDINGS.length)],
    room: `${100 + Math.floor(rand() * 300)}`,
  };
}

function generateCourses(): Course[] {
  const courses: Course[] = [];
  let crnCounter = 90000;
  let seed = 42;

  DEPARTMENTS.forEach((dept) => {
    const titles = TITLES[dept.code] ?? [`Intro to ${dept.name}`];
    titles.forEach((title, ti) => {
      const sectionsCount = 1 + (ti % 3);
      for (let s = 0; s < sectionsCount; s++) {
        seed += 1;
        const rand = seededRandom(seed * 17 + s);
        const courseNumber = 100 + ti * 50 + s * 5 + Math.floor(rand() * 10);
        const seatsTotal = [12, 16, 18, 20, 24][Math.floor(rand() * 5)];
        const isFull = rand() < 0.3;
        const seatsTaken = isFull ? seatsTotal : Math.floor(rand() * seatsTotal);
        const waitlistTotal = isFull ? [3, 5, 8][Math.floor(rand() * 3)] : 0;
        const waitlistTaken = isFull ? Math.floor(rand() * waitlistTotal) : 0;
        const meetingCount = rand() > 0.6 ? 2 : 1;
        const meetings = Array.from({ length: meetingCount }, () => buildMeeting(rand));

        crnCounter += 7;
        courses.push({
          crn: String(crnCounter),
          subject: dept.code,
          courseNumber,
          section: String(s + 1).padStart(3, "0"),
          title,
          department: dept.name,
          instructor: INSTRUCTORS[Math.floor(rand() * INSTRUCTORS.length)],
          credits: [1, 3, 4, 4, 4][Math.floor(rand() * 5)],
          meetings,
          seatsTotal,
          seatsTaken,
          waitlistTotal,
          waitlistTaken,
        });
      }
    });
  });

  return courses;
}

export const ALL_COURSES = generateCourses();
