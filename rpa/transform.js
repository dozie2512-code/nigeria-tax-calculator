#!/usr/bin/env node
/**
 * transform.js — Convert a downloaded TaxProMax_CIT.json into a filing.json
 * that rpa/run.js can consume.
 *
 * Usage:
 *   node transform.js [input] [output]
 *
 *   input   Path to the source JSON (default: ./TaxProMax_CIT.json)
 *   output  Path to write the result  (default: ./filing.json)
 *
 * Examples:
 *   node transform.js
 *   node transform.js ~/Downloads/TaxProMax_CIT.json ./filing.json
 *   node transform.js /path/to/TaxProMax_CIT.json ./my-filing.json
 *
 * The script accepts two input formats:
 *
 *   1. Rich export  — produced by the updated nigeria-tax-calculator app.
 *      Contains `metadata`, `taxType`, `robotHints`, `scheduleSections`, and
 *      an `amounts` object with computed CIT figures.
 *      → The script copies these directly into filing.json.
 *
 *   2. Stub export  — older app versions only export `metadata`, `taxType`,
 *      `robotHints`, and `scheduleSections` with no `amounts`.
 *      → The script creates a filing.json with 0-valued amount stubs so
 *        the user can fill in the real numbers before running run.js.
 *
 * Output format (filing.json):
 *   {
 *     "portal":         "TaxProMax",
 *     "taxType":        "CIT",
 *     "period":         "2024",
 *     "tin":            "...",
 *     "businessName":   "...",
 *     "scheduleStatus": "Final",
 *     "amounts": {
 *       "revenue":                   0,
 *       "nonCurrentAssets":          0,
 *       "currentAsset":              0,
 *       "costOfSales":               0,
 *       "otherIncome":               0,
 *       "operatingExpenses":         0,
 *       "currentLiabilities":        0,
 *       "longTermLiabilities":       0,
 *       "ownershipCapitalStructure": 0,
 *       "reserve":                   0,
 *       "profitAdjustment":          0,
 *       "balancingAdjustment":       0,
 *       "lossRelieved":              0,
 *       "capitalAllowance":          0
 *     }
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Amount-field defaults (all keys that run.js / selectors file expect) ─────
const AMOUNT_DEFAULTS = {
  revenue:                   0,
  nonCurrentAssets:          0,
  currentAsset:              0,
  costOfSales:               0,
  otherIncome:               0,
  operatingExpenses:         0,
  currentLiabilities:        0,
  longTermLiabilities:       0,
  ownershipCapitalStructure: 0,
  reserve:                   0,
  profitAdjustment:          0,
  balancingAdjustment:       0,
  lossRelieved:              0,
  capitalAllowance:          0,
};

// ── Argument handling ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const inputArg  = args[0] || './TaxProMax_CIT.json';
const outputArg = args[1] || './filing.json';

const inputPath  = path.isAbsolute(inputArg)  ? inputArg  : path.resolve(__dirname, inputArg);
const outputPath = path.isAbsolute(outputArg) ? outputArg : path.resolve(__dirname, outputArg);

// ── Read source JSON ──────────────────────────────────────────────────────────
if (!fs.existsSync(inputPath)) {
  console.error(`\n[transform] ERROR: Input file not found: ${inputPath}`);
  console.error('[transform]   Export TaxProMax_CIT.json from the app first,');
  console.error('[transform]   then copy it into the rpa/ directory.');
  console.error('[transform]   Or pass the full path as the first argument:\n');
  console.error('[transform]     node transform.js ~/Downloads/TaxProMax_CIT.json\n');
  process.exit(1);
}

let source;
try {
  source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error(`[transform] ERROR: Could not parse JSON: ${inputPath}\n${e.message}`);
  process.exit(1);
}

// ── Build filing payload ──────────────────────────────────────────────────────
const meta    = source.metadata || {};
const hasFull = source.amounts && Object.keys(source.amounts).length > 0;

const filing = {
  portal:         'TaxProMax',
  taxType:        source.taxType || 'CIT',
  period:         meta.period       || String(new Date().getFullYear()),
  tin:            meta.tin          || '',
  businessName:   meta.businessName || '',
  scheduleStatus: 'Final',
  amounts: {},
};

if (hasFull) {
  // Merge computed amounts from the rich export, filling any missing keys with 0
  filing.amounts = { ...AMOUNT_DEFAULTS, ...source.amounts };
  console.log(`\n[transform] ✅ Rich export detected — amounts copied from ${path.basename(inputPath)}.`);
} else {
  // Stub: all zeros; user must fill in manually
  filing.amounts = { ...AMOUNT_DEFAULTS };
  console.log(`\n[transform] ⚠️  Stub export detected — no amounts in source file.`);
  console.log('[transform]    All amount fields have been set to 0.');
  console.log(`[transform]    Open "${path.basename(outputPath)}" and fill in the real values.`);
}

// ── Write output ──────────────────────────────────────────────────────────────
// Refuse to overwrite a real filing file that already has non-zero amounts unless user
// explicitly provides a distinct output path.
if (
  fs.existsSync(outputPath) &&
  outputArg === './filing.json' &&
  args.length < 2
) {
  const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const hasData  = existing.amounts && Object.values(existing.amounts).some((v) => Number(v) !== 0);
  if (hasData) {
    console.warn(`\n[transform] ⚠️  ${outputPath} already exists with non-zero values.`);
    console.warn('[transform]    To overwrite it, pass the output path explicitly:');
    console.warn(`[transform]      node transform.js "${inputArg}" ./filing.json\n`);
    process.exit(0);
  }
}

fs.writeFileSync(outputPath, JSON.stringify(filing, null, 2) + '\n');
console.log(`[transform] 📄 Written : ${outputPath}`);

if (filing.tin) {
  console.log(`[transform]    TIN          : ${filing.tin}`);
}
if (filing.businessName) {
  console.log(`[transform]    Business     : ${filing.businessName}`);
}
console.log(`[transform]    Period       : ${filing.period}`);
console.log(`[transform]    Revenue      : ${filing.amounts.revenue}`);
console.log(`[transform]    Capital All. : ${filing.amounts.capitalAllowance}`);

if (!hasFull) {
  console.log(`\n[transform] Next steps:`);
  console.log(`[transform]   1. Open ${outputPath} and fill in all "0" values.`);
  console.log('[transform]   2. Set FILING_JSON=./filing.json in your rpa/.env.');
  console.log('[transform]   3. Run: node run.js');
} else {
  console.log(`\n[transform] Next steps:`);
  console.log('[transform]   1. Review the amounts above; edit filing.json if needed.');
  console.log('[transform]   2. Set FILING_JSON=./filing.json in your rpa/.env.');
  console.log('[transform]   3. Run: node run.js');
}
console.log('');
