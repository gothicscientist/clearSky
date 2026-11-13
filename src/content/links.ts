/**
 * Lesson ids that other workstreams deep-link to with `routes.lesson(id)`.
 * Stream E MUST ship a lesson for every id here (an e2e flow checks each one
 * opens). Add new well-known ids only through the orchestrator.
 */
export const LESSON = {
  /** What turbulence is, why it's uncomfortable not dangerous (Outlook, G-meter, truth card) */
  turbulenceBasics: 'turbulence-basics',
  /** Light / moderate / severe, as defined in the FAA AIM (Outlook) */
  turbulenceLevels: 'turbulence-levels',
  /** How strong an airliner is: limit vs ultimate load (G-meter) */
  howStrong: 'how-strong-is-a-plane',
  /** Why a go-around is normal (Companion: approach/landing) */
  goArounds: 'go-arounds',
  /** Engines, gliding, redundancy (crashing fear) */
  engines: 'engines-and-redundancy',
  /** Who is flying: two pilots, training, checks (control fear) */
  whoIsFlying: 'who-is-flying',
  /** Panic physiology (panic fear, SOS "what's happening in my body") */
  panicBody: 'panic-in-the-body',
  /** Weather reports and their limits (Outlook "how to read this") */
  weatherReports: 'reading-weather-reports',
} as const;

export type WellKnownLesson = (typeof LESSON)[keyof typeof LESSON];
