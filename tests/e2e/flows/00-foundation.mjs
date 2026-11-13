// Foundation flows: routing guards and the app shell. Owned by the orchestrator.
import { eq, expect } from '../lib/context.mjs';

export default [
  {
    name: 'fresh install opens onboarding',
    async run(t) {
      await t.start('fresh');
      await t.see('onboarding.hook');
    },
  },
  {
    name: 'hard paywall: deep links bounce an unpaid user to the paywall',
    async run(t) {
      await t.start('onboarded', '/today');
      await t.see('paywall.screen');
      for (const path of ['/calm', '/fly', '/learn', '/sos', '/journey/logbook', '/settings']) {
        await t.goto(path);
        await t.see('paywall.screen');
      }
    },
  },
  {
    name: 'subscriber lands on Today with four tabs and SOS',
    async run(t) {
      await t.start('pro');
      await t.see('today.home');
      for (const tab of ['calm', 'fly', 'learn', 'today']) {
        await t.tap(`app.tab.${tab}`);
        await t.see(`${tab}.home`);
      }
      await t.tap('app.sos-button');
      await t.see('sos.screen');
    },
  },
  {
    name: 'onboarding hands over to the paywall, and purchase unlocks the app',
    async run(t) {
      await t.start('fresh');
      await t.tap('onboarding.hook.continue');
      await t.see('paywall.screen');
      await t.tap('paywall.cta');
      await t.see('today.home', { timeout: 15000 });
      const s = await t.appState();
      expect(s.entitlement.active === true, 'entitlement is cached after purchase');
    },
  },
  {
    name: 'legal documents are readable before purchase',
    async run(t) {
      await t.start('onboarded', '/legal/terms');
      await t.see('legal.doc');
    },
  },
  {
    name: 'entitlement survives relaunch while offline',
    async run(t) {
      await t.start('pro');
      await t.see('today.home');
      await t.offline(true);
      await t.relaunch();
      await t.see('today.home');
      const s = await t.appState();
      expect(s.entitlement.active === true, 'entitlement should still be active offline');
      await t.offline(false);
    },
  },
  {
    name: 'lapsed subscription returns to the paywall and keeps data',
    async run(t) {
      await t.start('proWithFlight');
      await t.see('today.home');
      await t.bridge('purchases.expire()');
      await t.see('paywall.screen');
      const s = await t.appState();
      eq(s.flights.length, 1, 'flights are kept after lapse');
    },
  },
  {
    name: 'corrupt storage never crashes the app',
    async run(t) {
      await t.start('pro');
      await t.bridge('corrupt("profile")');
      await t.relaunch();
      // Profile is quarantined -> onboarding again, but the app runs.
      await t.see('onboarding.hook');
      const raw = await t.bridge('stored("profile.corrupt")');
      expect(raw && raw.includes('{not json'), 'corrupt payload is moved aside, not lost');
    },
  },
];
