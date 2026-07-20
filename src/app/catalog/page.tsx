import Link from "next/link";

export default function CatalogPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-3">Coming soon</p>
      <h1 className="font-display text-3xl text-ink mb-3">Course Catalog</h1>
      <p className="text-ink-soft mb-8">
        This case study focuses on the class search, filter, and browse flow. This screen
        wasn&apos;t part of the redesign scope.
      </p>
      <Link href="/" className="text-sm font-medium text-ink underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
