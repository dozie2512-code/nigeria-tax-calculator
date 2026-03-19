#!/usr/bin/env node
/**
 * TaxProMax CIT RPA Runner
 *
 * Modes:
 *   review (default) — navigates, fills fields, saves screenshots/log. Does NOT submit.
 *   submit           — same as review but also clicks the final Submit button.
 *
 * Usage:
 *   node run.js
 *   npm run rpa
 *   RPA_MODE=submit node run.js
 *
 * Required environment variables (see .env.example):
 *   TAXPROMAX_EMAIL       TaxProMax login e-mail / TIN
 *   TAXPROMAX_PASSWORD    TaxProMax password
 *
 * Optional environment variables:
 *   TAXPROMAX_BASE_URL    Base URL (default: https://taxpromax.firs.gov.ng)
 *   TAXPROMAX_LOGIN_URL   Full login URL (default: BASE_URL/taxpayer/logincit)
 *   TAXPROMAX_PENDING_URL Pending-filings URL (default: BASE_URL/taxpayer/pending)
 *   TAXPROMAX_SCHEDULE_URL Specific schedule URL override for /taxpayer/sch26?id=...; skips clicking Process if set
 *   RPA_MODE              "review" | "submit"  (default: "review")
 *   SELECTORS_FILE        Path to selectors JSON (default: ./selectors.taxpromax.example.json)
 *   FILING_JSON           Path to filing payload  (default: ./filing.sample.json)
 *   HEADLESS              "true" | "false"  (default: "false")
 *   SLOW_MO               Browser slowMo in ms (default: 80)
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Support loading a .env file if present (optional; dotenv is a devDependency)
try {
  const { config } = await import('dotenv');
  config();
} catch {
  // dotenv not available or .env not present; continue with process.env as-is
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Small helpers ────────────────────────────────────────────────────────────

function getEnv(key, fallback = '') {
  return process.env[key] ?? fallback;
}

function requireEnv(key) {
  const val = process.env[key];
  if (!val) {
    console.error(`\n[rpa] ERROR: Required environment variable "${key}" is not set.`);
    console.error('       Copy .env.example to rpa/.env and fill in your credentials.');
    console.error('       See RPA.md for setup instructions.\n');
    process.exit(1);
  }
  return val;
}

function loadJson(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(__dirname, filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`[rpa] ERROR: File not found: ${resolved}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (e) {
    console.error(`[rpa] ERROR: Could not parse JSON: ${resolved}\n${e.message}`);
    process.exit(1);
  }
}

function makeArtifactDir() {
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const dir = path.resolve(__dirname, 'artifacts', ts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function snap(page, dir, name) {
  const p = path.join(dir, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`[rpa]   📷 ${path.basename(dir)}/${name}.png`);
  return p;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  // ── Read & validate configuration ─────────────────────────────────────────
  const email    = requireEnv('TAXPROMAX_EMAIL');
  const password = requireEnv('TAXPROMAX_PASSWORD');

  const baseUrl       = getEnv('TAXPROMAX_BASE_URL',    'https://taxpromax.firs.gov.ng');
  const loginUrl      = getEnv('TAXPROMAX_LOGIN_URL',   `${baseUrl}/taxpayer/logincit`);
  const pendingUrl    = getEnv('TAXPROMAX_PENDING_URL',  `${baseUrl}/taxpayer/pending`);
  const scheduleUrl   = getEnv('TAXPROMAX_SCHEDULE_URL', '');
  const rpaMode       = getEnv('RPA_MODE',               'review').toLowerCase();
  const headless      = getEnv('HEADLESS',               'false') === 'true';
  const slowMo        = parseInt(getEnv('SLOW_MO', '80'), 10);
  const selectorsFile = getEnv('SELECTORS_FILE', './selectors.taxpromax.example.json');
  const filingFile    = getEnv('FILING_JSON',    './filing.sample.json');

  if (!['review', 'submit'].includes(rpaMode)) {
    console.error(`[rpa] ERROR: RPA_MODE must be "review" or "submit", got "${rpaMode}"`);
    process.exit(1);
  }

  console.log('\n[rpa] ═══════════════════════════════════════════════');
  console.log(`[rpa]  TaxProMax CIT RPA Runner`);
  console.log(`[rpa]  Mode     : ${rpaMode.toUpperCase()}`);
  console.log(`[rpa]  Headless : ${headless}`);
  console.log('[rpa] ═══════════════════════════════════════════════\n');

  if (rpaMode === 'submit') {
    console.warn('[rpa] ⚠️  SUBMIT MODE — final submission WILL be triggered automatically!');
    console.warn('[rpa]    Ensure all values in filing.json are correct before proceeding.\n');
  } else {
    console.log('[rpa] ✅ REVIEW MODE — bot will NOT click the final Submit button.\n');
  }

  // ── Load selectors + filing payload ───────────────────────────────────────
  const sel    = loadJson(selectorsFile);
  const filing = loadJson(filingFile);

  // ── Artifact directory ─────────────────────────────────────────────────────
  const dir = makeArtifactDir();
  console.log(`[rpa] Artifacts  : ${dir}\n`);

  const runLog = {
    mode: rpaMode,
    filingJson: filingFile,
    selectorsFile,
    startedAt: new Date().toISOString(),
    steps: [],
    errors: [],
  };

  function step(name, detail = {}) {
    const entry = { name, ts: new Date().toISOString() };
    if (Object.keys(detail).length) entry.detail = detail;
    runLog.steps.push(entry);
    const detailStr = Object.keys(detail).length
      ? '  ' + JSON.stringify(detail)
      : '';
    console.log(`[rpa] ▶ ${name}${detailStr}`);
  }

  function logError(context, err) {
    runLog.errors.push({ context, message: err.message, ts: new Date().toISOString() });
    console.error(`[rpa]   ⚠️  ${context}: ${err.message}`);
  }

  function saveRunLog() {
    runLog.finishedAt = new Date().toISOString();
    const logPath = path.join(dir, 'run-log.json');
    fs.writeFileSync(logPath, JSON.stringify(runLog, null, 2));
    console.log(`[rpa] 📄 Log saved : ${logPath}`);
  }

  // ── Browser ────────────────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless, slowMo });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page    = await context.newPage();

  try {
    // ── Step 1: Login ─────────────────────────────────────────────────────
    step('Navigate to login', { url: loginUrl });
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    await snap(page, dir, '01-login-page');

    step('Fill login credentials');
    await page.locator(sel.login.emailField).waitFor({ state: 'visible' });
    await page.locator(sel.login.emailField).fill(email);
    await page.locator(sel.login.passwordField).fill(password);

    step('Submit login form');
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.locator(sel.login.submitButton).click(),
    ]);

    // Detect failed login
    const currentUrl = page.url();
    const loginPaths = ['logincit', '/login', '/signin'];
    if (loginPaths.some((p) => currentUrl.includes(p))) {
      let errMsg = `Still on login page after submit (${currentUrl}).`;
      if (sel.login.errorSelector) {
        const errText = await page
          .locator(sel.login.errorSelector)
          .textContent()
          .catch(() => null);
        if (errText) errMsg = `Login failed: ${errText.trim()}`;
      }
      throw new Error(errMsg);
    }

    step('Login successful', { url: page.url() });
    await snap(page, dir, '02-post-login');

    // ── Step 2: Navigate to Pending filings ───────────────────────────────
    step('Navigate to Pending filings', { url: pendingUrl });
    await page.goto(pendingUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await snap(page, dir, '03-pending-page');

    // ── Step 3: Click "Process" on the "Installment Payment" row ─────────
    if (!scheduleUrl) {
      step('Locate and click Process button for Installment Payment row');

      const rowSel = sel.pending?.filingRow || 'tr, .filing-row, [class*="row"]';
      const btnSel = sel.pending?.processButton || 'text=Process, button:has-text("Process"), a:has-text("Process")';

      let clickedRow = false;

      // Primary: find the row that contains "Installment Payment" text
      const rows = page.locator(rowSel);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const text = await row.textContent().catch(() => '');
        const lowerText = text.toLowerCase();
        const matchesInstallment = lowerText.includes('installment payment') ||
                                   lowerText.includes('instalment payment');
        const matchesTin    = filing.tin    && text.includes(filing.tin);
        const matchesPeriod = filing.period && text.includes(filing.period);
        if (matchesInstallment || (matchesTin && matchesPeriod)) {
          await row.locator(btnSel).first().click();
          clickedRow = true;
          step('Clicked Process on matched row', {
            matchedText: text.trim().slice(0, 80),
            tin: filing.tin,
            period: filing.period,
          });
          break;
        }
      }

      if (!clickedRow) {
        // Fall back: click the first visible Process button
        step('No matching row found — clicking first Process button as fallback');
        await page.locator(btnSel).first().click();
      }

      await page.waitForLoadState('networkidle');
      await snap(page, dir, '04-after-process-click');
    }

    // ── Step 4: Navigate to schedule page (if a URL override is set) ──────
    const targetScheduleUrl = scheduleUrl || page.url();
    if (scheduleUrl && page.url() !== scheduleUrl) {
      step('Navigate to Schedule URL override', { url: scheduleUrl });
      await page.goto(scheduleUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
    }

    // ── Verify we landed on /taxpayer/sch26?id=... ─────────────────────
    const currentScheduleUrl = page.url();
    const onSch26 = /\/taxpayer\/sch26\?id=/i.test(currentScheduleUrl);
    if (onSch26) {
      step('Verified: landed on /taxpayer/sch26?id=...', { url: currentScheduleUrl });
    } else {
      const msg = `Expected URL to match /taxpayer/sch26?id=... but got: ${currentScheduleUrl}`;
      logError('Schedule URL verification', new Error(msg));
      step('Warning: schedule URL did not match expected pattern', { url: currentScheduleUrl });
    }

    step('On schedule page', { url: currentScheduleUrl });
    await snap(page, dir, '05-schedule-page');

    // ── Step 5: Set Schedule Status (dropdown) ────────────────────────────
    if (sel.schedule?.statusSelect && filing.scheduleStatus) {
      try {
        await page.selectOption(sel.schedule.statusSelect, filing.scheduleStatus);
        step('Set schedule status', { value: filing.scheduleStatus });
      } catch (err) {
        logError('Set schedule status', err);
      }
    }

    // ── Step 6: Fill all monetary / numeric fields ────────────────────────
    step('Filling CIT schedule fields');
    const fieldSelectors = sel.schedule?.fields || {};
    const amounts        = filing.amounts || {};

    for (const [fieldKey, selector] of Object.entries(fieldSelectors)) {
      if (!selector) {
        step(`Skip "${fieldKey}" — selector not configured`, { hint: 'Update selectors.taxpromax.example.json' });
        continue;
      }
      const value = amounts[fieldKey];
      if (value === undefined || value === null) {
        step(`Skip "${fieldKey}" — no value in filing payload`);
        continue;
      }
      try {
        const locator = page.locator(selector);
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        await locator.fill(String(value));
        step(`Filled "${fieldKey}"`, { value, selector });
      } catch (err) {
        logError(`Fill field "${fieldKey}" (${selector})`, err);
      }
    }

    await snap(page, dir, '06-fields-filled');

    // ── Step 7: Click Save / Validate ─────────────────────────────────────
    if (sel.schedule?.saveButton) {
      step('Click Save/Validate');
      await page.locator(sel.schedule.saveButton).click();
      await page.waitForLoadState('networkidle');
      await snap(page, dir, '07-after-save');
    } else {
      step('Skip Save — selector not configured');
    }

    // ── Step 8: Review Mode — stop here ───────────────────────────────────
    if (rpaMode === 'review') {
      await snap(page, dir, '08-review-stop');
      step('REVIEW COMPLETE — stopped before final Submit (review mode)');
      console.log('\n[rpa] ══════════════════════════════════════════════════════');
      console.log('[rpa]  ✅ Review mode complete. Inspect artifacts below.');
      console.log(`[rpa]     ${dir}`);
      console.log('[rpa]  ℹ️  To submit, re-run with: RPA_MODE=submit node run.js');
      console.log('[rpa] ══════════════════════════════════════════════════════\n');
    } else {
      // ── Step 9: Submit Mode ────────────────────────────────────────────
      if (!sel.schedule?.submitButton) {
        throw new Error(
          'RPA_MODE=submit but sel.schedule.submitButton is not configured. ' +
          'Update selectors.taxpromax.example.json with the correct Submit button selector.'
        );
      }

      step('SUBMIT MODE — clicking final Submit button');
      await page.locator(sel.schedule.submitButton).click();
      await page.waitForLoadState('networkidle');
      await snap(page, dir, '08-submitted');

      // Capture confirmation / reference number
      if (sel.schedule?.confirmationSelector) {
        const confirmText = await page
          .locator(sel.schedule.confirmationSelector)
          .textContent()
          .catch(() => null);
        if (confirmText) {
          step('Submission confirmation received', { text: confirmText.trim() });
          runLog.confirmationText = confirmText.trim();
        }
      }

      console.log('\n[rpa] ✅ Submission complete. See artifacts for confirmation screenshot.\n');
    }
  } catch (err) {
    console.error(`\n[rpa] ❌ Fatal error: ${err.message}\n`);
    runLog.errors.push({
      context: 'fatal',
      message: err.message,
      ts: new Date().toISOString(),
    });
    await snap(page, dir, '99-error').catch(() => {});
    process.exitCode = 1;
  } finally {
    saveRunLog();
    await context.close();
    await browser.close();
  }
}

run();
