"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEPARTMENTS } from "@/lib/departments";
import { useTerm } from "@/lib/useTerm";
import DepartmentCombobox from "@/components/DepartmentCombobox";

export default function SearchPage() {
  const router = useRouter();
  const { term } = useTerm();

  const [dept, setDept] = useState("");
  const [subCode, setSubCode] = useState("");
  const [title, setTitle] = useState("");
  const [courseMin, setCourseMin] = useState("");
  const [courseMax, setCourseMax] = useState("");
  const [creditMin, setCreditMin] = useState("");
  const [creditMax, setCreditMax] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  const selectedDept = DEPARTMENTS.find((d) => d.code === dept);

  const numericProps = {
    inputMode: "numeric" as const,
    pattern: "[0-9]*",
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    },
  };

  const canClear = useMemo(
    () => dept || subCode || title || courseMin || courseMax || creditMin || creditMax || openOnly,
    [dept, subCode, title, courseMin, courseMax, creditMin, creditMax, openOnly]
  );

  function clearAll() {
    setDept("");
    setSubCode("");
    setTitle("");
    setCourseMin("");
    setCourseMax("");
    setCreditMin("");
    setCreditMax("");
    setOpenOnly(false);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (dept) params.set("dept", dept);
    if (subCode) params.set("subCode", subCode);
    if (title) params.set("title", title);
    if (courseMin) params.set("courseMin", courseMin);
    if (courseMax) params.set("courseMax", courseMax);
    if (creditMin) params.set("creditMin", creditMin);
    if (creditMax) params.set("creditMax", creditMax);
    if (openOnly) params.set("openOnly", "1");
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-2">
        {term.label}
      </p>
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-8">
        Find your classes
      </h1>

      <div className="rounded-2xl border border-line bg-card p-6 md:p-8 space-y-6">
        <Field label="Department or Program">
          <DepartmentCombobox
            value={dept}
            onChange={(v) => {
              setDept(v);
              setSubCode("");
            }}
          />
        </Field>

        {selectedDept?.subCodes && (
          <Field label={`Specific ${selectedDept.name} track`} hint="Optional — narrows within this department">
            <select
              value={subCode}
              onChange={(e) => setSubCode(e.target.value)}
              className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-gold"
            >
              <option value="">Any track</option>
              {selectedDept.subCodes.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Course title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Organic Chemistry"
            className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-gold"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Course number" hint="e.g. 100 or a range">
            <div className="flex items-center gap-2">
              <input
                {...numericProps}
                value={courseMin}
                onChange={(e) => setCourseMin(e.target.value)}
                placeholder="100"
                maxLength={3}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-gold"
              />
              <span className="text-muted text-sm">–</span>
              <input
                {...numericProps}
                value={courseMax}
                onChange={(e) => setCourseMax(e.target.value)}
                placeholder="299"
                maxLength={3}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-gold"
              />
            </div>
          </Field>

          <Field label="Credit hours">
            <div className="flex items-center gap-2">
              <input
                {...numericProps}
                value={creditMin}
                onChange={(e) => setCreditMin(e.target.value)}
                placeholder="1"
                maxLength={2}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-gold"
              />
              <span className="text-muted text-sm">–</span>
              <input
                {...numericProps}
                value={creditMax}
                onChange={(e) => setCreditMax(e.target.value)}
                placeholder="4"
                maxLength={2}
                className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-muted outline-none focus-visible:outline-2 focus-visible:outline-gold"
              />
            </div>
          </Field>
        </div>

        <label className="flex items-center justify-between rounded-lg bg-paper border border-line px-4 py-3 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-ink">Available seats only</p>
            <p className="text-xs text-muted">Hide sections that are already full</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={openOnly}
            onClick={() => setOpenOnly((o) => !o)}
            className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
              openOnly ? "bg-open" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                openOnly ? "translate-x-4" : ""
              }`}
            />
          </button>
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSearch}
            className="rounded-full bg-ink text-paper px-6 py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors"
          >
            Search classes
          </button>
          {canClear && (
            <button
              onClick={clearAll}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
