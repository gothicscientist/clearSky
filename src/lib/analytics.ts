/**
 * Privacy-first analytics seam. The default sink does nothing: clearSky ships
 * with no analytics or attribution SDK, and events never carry identifiers,
 * free text, flight details or fear scores.
 *
 * If the owner later adds a privacy-respecting, aggregate-only sink, it plugs in
 * with `setAnalyticsSink` — and the App Store privacy label must be updated.
 */

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_step'
  | 'onboarding_completed'
  | 'paywall_viewed'
  | 'paywall_plan_selected'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'purchase_cancelled'
  | 'restore_started'
  | 'restore_completed'
  | 'sos_opened'
  | 'tool_used'
  | 'flight_added'
  | 'companion_started'
  | 'debrief_completed'
  | 'card_shared'
  | 'lesson_completed'
  | 'outlook_viewed';

export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsSink {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}

const noop: AnalyticsSink = { track() {} };
let sink: AnalyticsSink = noop;

/** In-memory tail for e2e assertions and the developer panel. Never persisted, never sent. */
export const analyticsLog: { event: AnalyticsEvent; props?: AnalyticsProps }[] = [];

export function setAnalyticsSink(next: AnalyticsSink | null): void {
  sink = next ?? noop;
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (analyticsLog.length > 200) analyticsLog.splice(0, 100);
  analyticsLog.push({ event, props });
  try {
    sink.track(event, props);
  } catch {
    // Analytics must never break the app.
  }
}
