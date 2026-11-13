import { calmSources } from './calm';
import { commonSources } from './common';
import { entrySources } from './entry';
import { flySources } from './fly';
import { journeySources } from './journey';
import { learnSources } from './learn';
import { todaySources } from './today';
import type { Source } from './types';

export type { Source } from './types';

const all: Source[] = [
  ...commonSources,
  ...entrySources,
  ...calmSources,
  ...flySources,
  ...todaySources,
  ...learnSources,
  ...journeySources,
];

const byId = new Map<string, Source>();
for (const s of all) {
  if (__DEV__ && byId.has(s.id)) console.warn(`[sources] duplicate source id: ${s.id}`);
  byId.set(s.id, s);
}

export function getSource(id: string): Source | null {
  return byId.get(id) ?? null;
}

/** Every source, sorted by publisher then title (for the Sources & licences screen). */
export function allSources(): Source[] {
  return [...byId.values()].sort(
    (a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title),
  );
}
