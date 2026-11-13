/**
 * Index of the 7-session program. Stream E writes the sessions themselves (in
 * src/features/program) using exactly these ids; other streams (Today) read
 * this index to show "today's step" without importing the program feature.
 */
export interface ProgramStep {
  id: string;
  /** 1-based order */
  n: number;
  title: string;
  /** One-line promise shown on Today and in the program list */
  summary: string;
  minutes: number;
}

export const PROGRAM: ProgramStep[] = [
  { id: 'how-fear-works', n: 1, title: 'How fear works', summary: 'Why your brain treats a safe flight like a threat.', minutes: 6 },
  { id: 'body-alarm', n: 2, title: 'Your body’s alarm', summary: 'What the racing heart is doing, and how to turn it down.', minutes: 7 },
  { id: 'thoughts-on-trial', n: 3, title: 'Thoughts on trial', summary: 'Weigh the “what ifs” against the evidence.', minutes: 8 },
  { id: 'your-ladder', n: 4, title: 'Your ladder', summary: 'Small, chosen steps toward the flight.', minutes: 8 },
  { id: 'making-room', n: 5, title: 'Making room', summary: 'Let the feelings ride along without steering.', minutes: 7 },
  { id: 'flight-day-plan', n: 6, title: 'Flight-day plan', summary: 'Your hour-by-hour plan from home to gate to cruise.', minutes: 6 },
  { id: 'after-landing', n: 7, title: 'After landing', summary: 'Lock in what you learned so the next flight is easier.', minutes: 5 },
];

/** The first program step not yet completed, or null when all are done. */
export function nextProgramStep(done: Record<string, number>): ProgramStep | null {
  return PROGRAM.find((s) => !done[s.id]) ?? null;
}
