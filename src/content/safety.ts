/**
 * Safety and scope copy shared across onboarding, Settings, SOS and the program.
 * Wording is binding (App Review + wellness positioning): never "cure", "treat",
 * "clinically proven", success rates, or "flying is 100% safe".
 */

export const DISCLAIMER =
  'clearSky is a self-help wellness tool. It does not diagnose, treat or cure any condition and is not a substitute for professional care.';

export const DISCLAIMER_SHORT = 'A self-help tool, not medical care.';

export interface CrisisResource {
  id: string;
  label: string;
  detail: string;
  /** tel: / sms: value, or null when it's an instruction rather than a number */
  dial: string | null;
  region: 'any' | 'US' | 'UK-IE' | 'onboard';
}

/** Shown on the crisis screen (reachable offline from SOS "Still hard" and Settings). */
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'onboard',
    label: 'On a plane: tell the cabin crew',
    detail:
      'Press the call button or speak to any crew member. They are trained to help with anxiety and with medical problems, and they would much rather know.',
    dial: null,
    region: 'onboard',
  },
  {
    id: 'medical',
    label: 'Chest pain, fainting or trouble breathing',
    detail: 'Treat it as a medical problem, not anxiety. On board, tell the crew now. On the ground, call your local emergency number.',
    dial: null,
    region: 'any',
  },
  {
    id: 'emergency',
    label: 'Emergency services',
    detail: 'If you might be in danger, call your local emergency number (911 in the US, 999 or 112 in the UK and Ireland, 112 across the EU).',
    dial: null,
    region: 'any',
  },
  {
    id: 'us-988',
    label: '988 Suicide & Crisis Lifeline (US)',
    detail: 'Call or text 988, any time, free and confidential.',
    dial: 'tel:988',
    region: 'US',
  },
  {
    id: 'samaritans',
    label: 'Samaritans (UK & Ireland)',
    detail: 'Call 116 123, any time, free.',
    dial: 'tel:116123',
    region: 'UK-IE',
  },
];

/** When to recommend professional support (program, Settings, "Still hard"). */
export const SEEK_HELP_POINTS: string[] = [
  'Your fear has spread beyond flying, or it stops you doing everyday things.',
  'Flying brings up memories of a frightening event, or you have nightmares or flashbacks.',
  'You feel low most days, or you rely on alcohol or other substances to cope.',
  'You have a heart or lung condition, or you are pregnant — check with your doctor before exercises that deliberately raise your heart rate or change your breathing.',
];

export const MEDICATION_STANCE =
  'If you take medication for anxiety or for flying, follow your prescriber’s advice. clearSky works alongside it and never asks you to change it.';

export const ALCOHOL_STANCE =
  'A drink can feel like it takes the edge off, but alcohol tends to make anxiety worse as it wears off, and it dehydrates you in the dry cabin air. It is not a coping tool we recommend.';

export const PRIVACY_PROMISE =
  'No account. No tracking. Your answers, flights and notes stay on this phone unless you export them.';
