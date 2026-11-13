import type { FearType } from '@/types';

/**
 * One defensible, sourced fact per primary fear — the onboarding "truth card"
 * and the matching Learn entry point. Rules: §7 of docs/PLAN.md (no crash odds,
 * no invented numbers, no "100% safe"). Every source id resolves in
 * src/content/sources and is listed in docs/CONTENT_SOURCES.md.
 */
export interface TruthCard {
  fear: FearType;
  /** Short headline, sentence case, no exclamation marks */
  headline: string;
  body: string;
  sources: string[];
}

export const TRUTHS: Record<FearType, TruthCard> = {
  turbulence: {
    fear: 'turbulence',
    headline: 'Bumps are uncomfortable, not dangerous',
    body:
      'Airliners must be built to withstand one and a half times the highest loads they are ever expected to meet in service, and normal turbulence stays well inside those limits. The realistic risk in bumps is to people who are out of their seat or unbelted — so with your belt fastened, you are where you should be.',
    sources: ['cfr-25-303', 'cfr-25-305', 'cfr-25-341', 'faa-turbulence'],
  },
  crashing: {
    fear: 'crashing',
    headline: 'Airliners are designed around failure',
    body:
      'Airliner systems are certified on a fail-safe principle: no single failure should stop the aircraft from continuing to fly and land safely. That is why the systems that matter come in twos and threes, and why crews practise failures in simulators again and again.',
    sources: ['cfr-25-1309', 'cfr-121-441'],
  },
  control: {
    fear: 'control',
    headline: 'You are not the one who has to be in control',
    body:
      'Every airline flight has at least two pilots, each trained and regularly checked on that aircraft, with air traffic controllers following the flight the whole way. Letting go of control is uncomfortable — and it is also exactly what the system is built for.',
    sources: ['cfr-121-385', 'cfr-121-441'],
  },
  panic: {
    fear: 'panic',
    headline: 'Panic feels dangerous, but it is not',
    body:
      'A panic attack is your body’s alarm firing when there is no fire. It is intense and frightening, it peaks, and it passes on its own — usually within minutes. Slowing your out-breath helps your body notice the alarm is false.',
    sources: ['nhs-panic', 'nhs-breathing'],
  },
  takeoffLanding: {
    fear: 'takeoffLanding',
    headline: 'Takeoff and landing are the most practised parts of flying',
    body:
      'The noises that feel alarming are the aircraft doing its job: engines spooling up, the thump of the landing gear folding away, the whirr of flaps moving. Pilots rehearse every part of takeoff and landing — including going around for another try — in training and checks throughout their careers.',
    sources: ['faa-afh', 'cfr-121-441'],
  },
};
