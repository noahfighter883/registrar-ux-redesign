# Registrar — Course Registration UX Redesign

A functional prototype rebuilding a college course registration portal's core "find and register for classes" flow, based on a UX case study auditing an existing Ellucian/Banner-style system. **[Read the full case study →](https://docs.google.com/document/d/1JOj_ZjTxVr-80OZewXi0UGWPBMbZaEOyF-W_7YbGBxQ/edit?usp=sharing)**

## What this is

This project redesigns three screens from a real university registration system:

1. **Dashboard** — landing page for registration tasks
2. **Find Classes** — search/filter form
3. **Browse Classes** — results table with seat availability and scheduling

The redesign addresses pain points identified in a heuristic evaluation: excessive whitespace, redundant steps, unnecessary form fields, hover-only information, ambiguous input validation states, and functionally broken filters.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Mock course dataset (deterministic, generated client-side — no backend)
  
## Project structure

```
src/
  app/
    page.tsx          → Dashboard
    search/page.tsx    → Find Classes (search form)
    results/page.tsx   → Browse Classes (results table)
  components/          → Shared UI (multi-select combobox, header, status badges)
  lib/                  → Mock data, types, department/term config
```

## Deployment

Deployed on Vercel from this repo's `main` branch or [here](https://registrar-ux-redesign.vercel.app/).
