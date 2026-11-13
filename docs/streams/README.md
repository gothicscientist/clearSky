# Workstreams

Six parallel implementation streams, each in its own git worktree and branch, merged into `main`
by the orchestrator. Ownership is disjoint: a stream edits only the paths its brief lists. Everything
else is frozen (see `docs/PLAN.md` §8 and `CLAUDE.md`).

| Stream | Brief | Branch owner of |
|---|---|---|
| A Entry | [A-entry.md](A-entry.md) | onboarding, paywall, settings, legal, crisis |
| B Calm | [B-calm.md](B-calm.md) | SOS, breathing, grounding, games, ambient audio |
| C Fly | [C-fly.md](C-fly.md) | companion timeline, sounds & sensations, G-meter |
| D Today | [D-today.md](D-today.md) | home, add flight, airports UI, weather outlook |
| E Learn | [E-learn.md](E-learn.md) | lessons, program, sources ledger |
| F Journey | [F-journey.md](F-journey.md) | debrief, logbook, landing card |

## Rules every stream follows

1. `npm ci --prefer-offline --no-audit --no-fund` in the fresh worktree first.
2. Read `CLAUDE.md`, `docs/PLAN.md`, your brief, and the foundation code you build on
   (`src/ui`, `src/theme`, `src/stores`, `src/lib`, `src/content`, `src/types.ts`).
3. Replace your placeholder routes; keep the **contract testIDs** listed in your brief exactly.
4. Put screens/logic/content in `src/features/<name>/`; route files in `src/app/` stay thin.
5. Write e2e flows `tests/e2e/flows/<letter>-*.mjs` covering every acceptance criterion,
   including offline, empty, error and relaunch cases. Run them with
   `npm run e2e -- --only <letter>-` and fix until green; also run `npm run e2e -- --only 00-`
   to prove the foundation still passes.
6. `npm run typecheck` and `npm run lint` clean.
7. Need a foundation change (types, stores, ui, lib, content, deps)? Don't make it. Shim it in your
   feature folder and add it under **Requests** in your brief file (the one file outside your
   ownership you may edit is your own `docs/streams/<X>-*.md`, Requests/Notes sections only).
8. Add anything that can only be verified on a real iPhone under **Device checklist** in your brief.
9. Commit to your branch in small logical commits. Don't merge main; the orchestrator merges you.
10. Finish with a short report: what's done, what's not, test results, requests.
