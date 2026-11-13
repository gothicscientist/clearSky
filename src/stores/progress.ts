import type { ToolKind, ToolSession } from '@/types';

import { clock } from '@/lib/clock';

import { createPersistedStore } from './persist';

const MAX_SESSIONS = 600;

interface ProgressState {
  /** lesson id -> epoch ms first completed */
  lessonsRead: Record<string, number>;
  /** program session id -> epoch ms completed */
  programDone: Record<string, number>;
  /** Free-form per-feature answers (e.g. exposure ladder, thought records), keyed by `${feature}.${id}` */
  notes: Record<string, string>;
  /** Rolling log of tool use, newest last, capped at MAX_SESSIONS */
  sessions: ToolSession[];

  markLessonRead: (id: string) => void;
  markProgramDone: (id: string) => void;
  setNote: (key: string, value: string) => void;
  /**
   * Record one finished use of a tool. Call exactly once per session, when it ends
   * (including when the screen unmounts mid-session), with whole seconds actually spent.
   */
  logSession: (kind: ToolKind, ref: string, seconds: number, outcome?: string) => void;
}

export const useProgressStore = createPersistedStore<ProgressState>(
  { name: 'progress', version: 1 },
  (set) => ({
    lessonsRead: {},
    programDone: {},
    notes: {},
    sessions: [],

    markLessonRead: (id) =>
      set((s) => (s.lessonsRead[id] ? s : { lessonsRead: { ...s.lessonsRead, [id]: clock.now() } })),
    markProgramDone: (id) =>
      set((s) => (s.programDone[id] ? s : { programDone: { ...s.programDone, [id]: clock.now() } })),
    setNote: (key, value) => set((s) => ({ notes: { ...s.notes, [key]: value } })),
    logSession: (kind, ref, seconds, outcome) =>
      set((s) => {
        const secs = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
        const entry: ToolSession = { kind, ref, seconds: secs, at: clock.now(), ...(outcome ? { outcome } : {}) };
        const sessions = [...s.sessions, entry];
        return { sessions: sessions.length > MAX_SESSIONS ? sessions.slice(-MAX_SESSIONS) : sessions };
      }),
  }),
);

/** Total seconds logged for a tool kind. Derived, so it can never drift from the log. */
export function totalSeconds(sessions: ToolSession[], kind: ToolKind): number {
  return sessions.reduce((sum, s) => (s.kind === kind ? sum + s.seconds : sum), 0);
}

export function countSessions(sessions: ToolSession[], kind: ToolKind): number {
  return sessions.reduce((n, s) => (s.kind === kind ? n + 1 : n), 0);
}
