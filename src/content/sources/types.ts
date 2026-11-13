/**
 * A citable source. Every factual claim in the app points at one or more of
 * these by id, and every id is listed in docs/CONTENT_SOURCES.md.
 */
export interface Source {
  /** Stable kebab-case id, unique across all source files */
  id: string;
  title: string;
  publisher: string;
  /** Section / paragraph / page, e.g. "§25.337" or "Chapter 7, Section 1" */
  locator?: string;
  url?: string;
  /** Primary = regulator, manufacturer, investigator, peer-reviewed or national health body */
  kind: 'regulation' | 'guidance' | 'manufacturer' | 'investigation' | 'research' | 'health' | 'data';
}
