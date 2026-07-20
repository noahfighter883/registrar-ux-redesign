import Link from "next/link";

const secondaryCards = [
  {
    href: "/prepare",
    title: "Prepare for Registration",
    body: "Check your registration status and clear any holds before your window opens.",
    icon: (
      <path d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v13a1 1 0 01-1.45.9L12 18l-5.55 1.9A1 1 0 015 19V6a2 2 0 012-2z" />
    ),
  },
  {
    href: "/results",
    title: "My Schedule",
    body: "View your current, past, and in-progress class schedules.",
    icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    href: "/catalog",
    title: "Course Catalog",
    body: "Look up course descriptions, not tied to a specific term.",
    icon: <path d="M12 6.25C10.5 5 8.5 4.5 6.5 4.5c-1.13 0-2.23.16-3.25.47v13.28c1.02-.31 2.12-.47 3.25-.47 2 0 4 .5 5.5 1.75m0-14C13.5 5 15.5 4.5 17.5 4.5c1.13 0 2.23.16 3.25.47v13.28c-1.02-.31-2.12-.47-3.25-.47-2 0-4 .5-5.5 1.75m0-14v14" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-2">
          Registration
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight">
          What would you like to do?
        </h1>
      </div>

      <Link
        href="/search"
        className="group block rounded-2xl border border-line bg-card p-8 md:p-10 mb-6 hover:border-gold/50 hover:shadow-[0_8px_30px_-12px_rgba(22,35,63,0.15)] transition-all"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block font-mono text-[11px] uppercase tracking-widest text-gold bg-gold-soft rounded-full px-3 py-1 mb-4">
              Start here
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ink mb-2">
              Find &amp; Register for Classes
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Search the course list, check seat availability, and build your schedule
              for the term — all in one place.
            </p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center group-hover:bg-gold transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>

      <div className="grid sm:grid-cols-3 gap-4">
        {secondaryCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-line bg-card p-6 hover:border-gold/40 hover:bg-gold-soft/30 transition-colors"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="text-ink-soft mb-4"
            >
              {card.icon}
            </svg>
            <h3 className="font-semibold text-ink mb-1.5">{card.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
