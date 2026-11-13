// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Parallel workstreams check out git worktrees under .claude/worktrees (each with its
// own node_modules). Keep Metro from crawling them, and from crawling e2e output.
const escape = (p) => p.replace(/[/\\]/g, '[/\\\\]').replace(/[.*+?^${}()|]/g, '\\$&');
const blocked = [
  new RegExp(`${escape(path.join(__dirname, '.claude'))}[/\\\\].*`),
  new RegExp(`${escape(path.join(__dirname, 'dist'))}(-e2e)?[/\\\\].*`),
  new RegExp(`${escape(path.join(__dirname, 'tests'))}[/\\\\].*`),
];
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...blocked,
];

module.exports = config;
