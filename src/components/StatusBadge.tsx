import { Course } from "@/lib/types";

export default function StatusBadge({ course }: { course: Course }) {
  const seatsOpen = course.seatsTotal - course.seatsTaken;
  const isFull = seatsOpen <= 0;
  const waitOpen = course.waitlistTotal - course.waitlistTaken;

  if (isFull) {
    return (
      <div className="inline-flex flex-col gap-1 rounded-lg bg-full-soft border border-full/20 px-3 py-2 min-w-[168px]">
        <span className="flex items-center gap-1.5 text-full font-semibold text-sm whitespace-nowrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2zm0-4h-2V7h2z" />
          </svg>
          Full
        </span>
        {course.waitlistTotal > 0 && (
          <span className="text-xs text-wait whitespace-nowrap">
            {waitOpen} of {course.waitlistTotal} waitlist spots
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-0.5 rounded-lg bg-open-soft border border-open/20 px-3 py-2 min-w-[168px]">
      <span className="flex items-center gap-1.5 text-open font-semibold text-sm whitespace-nowrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.6l-4.4-4.4 1.4-1.4 3 3 6-6 1.4 1.4z" />
        </svg>
        {seatsOpen} open
      </span>
      <span className="text-xs text-ink-soft whitespace-nowrap">
        of {course.seatsTotal} seats
      </span>
    </div>
  );
}
