# Registrar — Course Registration UX Redesign

A functional prototype rebuilding a college course registration portal's core "find and register for classes" flow, based on a UX case study auditing an existing Ellucian/Banner-style system.

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

## Getting started

```bash
npm install
npm run dev
```

## Deployment

Deployed on Vercel from this repo's `main` branch.
