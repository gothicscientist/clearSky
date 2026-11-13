# Stream E — Learn: curriculum, program, sources ledger

## You own (exclusively)

- `src/features/{learn,program}/**`
- `src/app/(tabs)/learn/**`
- `src/content/sources/learn.ts`
- `docs/CONTENT_SOURCES.md` (the claim → source → status ledger for the WHOLE app; other streams
  list their claims in their own briefs' Notes and you consolidate what's in `main` at the time)
- `tests/e2e/flows/e-*.mjs`
- this file (Requests / Notes / Device checklist sections)

## Contract testIDs

- `learn.home` (Learn tab root)
- Routes: `routes.lesson(id)` → `/learn/lesson/[id]`, `routes.program(id)` → `/learn/program/[id]`,
  `routes.sources` → `/learn/sources`. Keep these paths.
- **Every id in `LESSON` (`src/content/links.ts`) must exist as a lesson** — other streams deep-link
  to them. Every id in `PROGRAM` (`src/content/program.ts`) must exist as a program session.

## Build

### Lessons (~24 explainers ≤ 3 min read, six modules)
Modules: turbulence · the aircraft · people & system · phases of flight · weather · "what if".
Each lesson: title, one-line promise, reading time, body in short sections (plain language, second
person, validate then inform), an optional "try this" calming action (link a tool via `routes`),
and a Sources footer (`SourceNote`). Mark read with `markLessonRead(id)`; log one
`logSession('lesson', id, seconds)` on leaving. Learn home: modules, progress (derived from
`lessonsRead`), the 7-session program card, and a "Sources & how we check facts" entry.

**Accuracy rules (binding):** PLAN §7 table — no crash odds, no "never crashed", no wing-bend
figures, no glide-distance numbers, no "air pockets", no "autopilot lands the plane", no
"100% safe". Anything marked VERIFY in the plan (turbulence injury counts, HEPA exchange rates,
go-around rates, G-AIRMET horizon, comparison g-values) ships only with a primary source; otherwise
cut it. Fetch and read every source you cite (regulator, manufacturer, investigator, peer-reviewed
or national health body); check URLs resolve. Record every claim in `docs/CONTENT_SOURCES.md` with
status `verified` (you read the source and it says this) or remove the claim.

### Program (7 sessions, `PROGRAM` ids)
how fear works · your body's alarm · thoughts on trial · your ladder · making room · flight-day
plan · after landing. CBT/ACT-informed self-help, labelled as self-help not treatment
(`DISCLAIMER`, `SEEK_HELP_POINTS` from `src/content/safety.ts` on the first and ladder sessions).
Emphasis and examples swap by `profile.answers.primaryFear`. Interactive pieces without typing
burdens: a thought-record (pick + optional short note), an exposure ladder the user orders/edits,
a flight-day plan checklist — saved in `progress.notes` with keys `program.<id>.<field>`.
Complete with `markProgramDone(id)` and one `logSession('program', id, seconds)`.

### Sources page (`/learn/sources`)
`allSources()` grouped by kind, plus "How we check facts" (the rules above in plain words) and the
data licences (OurAirports public domain, NOAA public data).

## e2e flows (`tests/e2e/flows/e-*.mjs`)
- every `LESSON` id opens with a title and at least one source; every module lists ≥ 3 lessons
- reading marks a lesson read, progress updates, one session logged; works offline after relaunch
- program: complete a session, notes persist across relaunch, next step advances; primary-fear
  variants differ (`onboarded` seed has turbulence primary — change it via the bridge and compare)
- sources page lists every source id referenced by lessons (no dangling ids)
- a content lint flow: no banned phrases anywhere in Learn text ("air pocket", "100% safe",
  "never crash", "1 in ", "times safer", "cure", "clinically proven", "deep breath", "just relax")

## Device checklist (add yours)
- Dynamic Type at the largest accessibility size: no truncation in lessons

## Requests

## Notes
