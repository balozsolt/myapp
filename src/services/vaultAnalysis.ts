// vaultAnalysis.ts — Local vault analysis that runs entirely in the browser.
// Actual password values are used only for hashing; they never leave this file.

import { PasswordEntry } from './api';
import { isPasswordPwned } from './hibp';

export interface WeakEntry  { label: string; url: string; issues: string[]; }
export interface BasicEntry { label: string; url: string; }
export interface OldEntry   { label: string; url: string; ageDays: number; }

export interface VaultAnalysisSummary {
  totalPasswords:    number;
  weakPasswords:     WeakEntry[];
  reusedPasswords:   BasicEntry[];
  oldPasswords:      OldEntry[];
  breachedPasswords: BasicEntry[];
}

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function getStrengthIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8)            issues.push("too short (under 8 characters)");
  if (!/[A-Z]/.test(password))        issues.push("no uppercase letter");
  if (!/[0-9]/.test(password))        issues.push("no number");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("no special character");
  return issues;
}

const OLD_THRESHOLD_DAYS = 90;

export async function analyzeVault(entries: PasswordEntry[]): Promise<VaultAnalysisSummary> {
  const now = Date.now();

  // ── Strength ────────────────────────────────────────────────────────────────
  const weakPasswords: WeakEntry[] = entries
    .map(e => ({ label: e.appName, url: e.url, issues: getStrengthIssues(e.password) }))
    .filter(e => e.issues.length > 0);

  // ── Reuse detection (SHA-256 so raw passwords are never stored) ─────────────
  const hashGroups = new Map<string, PasswordEntry[]>();
  await Promise.all(entries.map(async entry => {
    const h = await sha256hex(entry.password);
    const group = hashGroups.get(h) ?? [];
    group.push(entry);
    hashGroups.set(h, group);
  }));

  const reusedPasswords: BasicEntry[] = [];
  for (const group of Array.from(hashGroups.values())) {
    if (group.length > 1) {
      for (const e of group) reusedPasswords.push({ label: e.appName, url: e.url });
    }
  }

  // ── Age ─────────────────────────────────────────────────────────────────────
  const oldPasswords: OldEntry[] = entries
    .map(e => ({
      label:   e.appName,
      url:     e.url,
      ageDays: Math.floor((now - new Date(e.createdAt).getTime()) / 86_400_000),
    }))
    .filter(e => e.ageDays > OLD_THRESHOLD_DAYS);

  // ── HIBP breach check (k-anonymity — only hash prefix sent) ─────────────────
  const breachedPasswords: BasicEntry[] = [];
  await Promise.all(entries.map(async entry => {
    try {
      const count = await isPasswordPwned(entry.password);
      if (count > 0) breachedPasswords.push({ label: entry.appName, url: entry.url });
    } catch {
      // HIBP unavailable — skip silently
    }
  }));

  return {
    totalPasswords: entries.length,
    weakPasswords,
    reusedPasswords,
    oldPasswords,
    breachedPasswords,
  };
}
