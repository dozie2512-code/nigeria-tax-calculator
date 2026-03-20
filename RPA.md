# TaxProMax RPA — Setup & Usage Guide

This folder (`rpa/`) contains a **Playwright-based RPA runner** that automates CIT filing on
[TaxProMax](https://taxpromax.firs.gov.ng) without a public API.

> ⚠️ **Safety notice:** This automation interacts directly with FIRS's TaxProMax portal.
> Tax filing is high-stakes — an incorrect submission can attract penalties.
> Always run in **review mode** first, inspect the screenshots and log, and only switch to
> **submit mode** when you are satisfied that every figure is correct.

> 🔒 **CAPTCHA / MFA limitation:** The runner **cannot bypass CAPTCHAs or multi-factor
> authentication (MFA)**. If TaxProMax presents a CAPTCHA or OTP screen during login,
> the runner will pause and prompt you to complete it manually in the browser window.
> See [Manual Login Pause](#manual-login-pause) below.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Configuration](#3-configuration)
4. [Obtaining Real Selectors from DevTools](#4-obtaining-real-selectors-from-devtools)
5. [Preparing a Filing Payload](#5-preparing-a-filing-payload)
6. [Running the Bot](#6-running-the-bot)
7. [Understanding the Output (Artifacts)](#7-understanding-the-output-artifacts)
8. [Modes Reference](#8-modes-reference)
9. [GitHub Actions (CI Review Run)](#9-github-actions-ci-review-run)
10. [Troubleshooting](#10-troubleshooting)
11. [Safety & Disclaimer](#11-safety--disclaimer)

---

## 1. Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Internet access to taxpromax.firs.gov.ng | — |

---

## 2. Installation

```bash
# From the repository root
cd rpa
npm install

# Install the Chromium browser used by Playwright
npm run install:browsers
# or: npx playwright install chromium
```


---

## 3. Configuration

### 3a. Create your `.env` file

```bash
cp ../.env.example rpa/.env     # if running from the repo root
# — or —
cp ../.env.example .env         # if you are already inside rpa/
```

Setting credentials is **optional**. If `TAXPROMAX_EMAIL` and `TAXPROMAX_PASSWORD` are both
set, the runner logs in automatically. If either is missing, the runner opens the browser
and pauses so you can log in manually (see [Manual Login Pause](#manual-login-pause)).

```dotenv
# Optional — if absent the runner opens a browser for manual login
TAXPROMAX_EMAIL=your_email@example.com
TAXPROMAX_PASSWORD=your_password
```

> 🔒 `rpa/.env` is listed in `rpa/.gitignore`. Never commit it.

### Manual Login Pause

If `TAXPROMAX_EMAIL` or `TAXPROMAX_PASSWORD` are not set, the runner will:

1. Open a visible browser window and navigate to the TaxProMax login page.
2. Print a prompt in the terminal:

   ```
   [rpa]  ℹ️  MANUAL LOGIN REQUIRED
   [rpa]  The browser is open. Please:
   [rpa]    1. Log in to TaxProMax in the browser window.
   [rpa]    2. Complete any CAPTCHA or multi-factor authentication.
   [rpa]    3. Return here and press Enter when you are logged in.
   ```

3. Wait for you to press **Enter** before continuing.

> ⚠️ **CAPTCHA / MFA**: The runner **cannot** solve CAPTCHAs or enter OTP codes
> automatically. Use manual login mode whenever the portal prompts for these.
> Automated login with credentials also cannot bypass these challenges — if
> the portal adds a CAPTCHA, switch to manual mode.

### 3b. Choose a selectors file

The file `rpa/selectors.taxpromax.example.json` ships with **placeholder** selectors.
You must replace every `"REPLACE_ME ..."` value with the real CSS selector for that
field on TaxProMax before the form-filling steps will work.

The file now includes selectors for the key SCH26 interactions:

| Selector key | Purpose |
|---|---|
| `schedule.returningCurrencyRadio` | Radio button for selecting Naira (NGN) as returning currency |
| `schedule.proceedButton` | The "Proceed" button on the schedule page |
| `schedule.fields.*` | Numeric input fields (Revenue, COGS, Capital Allowance, etc.) |
| `schedule.saveButton` | Save / Validate button |
| `schedule.submitButton` | Final Submit button (submit mode only) |

See **Section 4** for how to get those selectors.

```bash
# Make your own copy so the example is never overwritten
cp rpa/selectors.taxpromax.example.json rpa/selectors.taxpromax.json
```

Point the runner at it:

```dotenv
SELECTORS_FILE=./selectors.taxpromax.json
```

---

## 4. Obtaining Real Selectors from DevTools

1. Open **Chrome** or **Edge** and navigate to  
   `https://taxpromax.firs.gov.ng/taxpayer/logincit`
2. Press **F12** to open DevTools.
3. Click the **Inspect** icon (Ctrl+Shift+C / ⌘+Shift+C) and hover over a form field.
4. The matching HTML element is highlighted in the Elements panel.
5. Look for these attributes (in preference order):

   | Priority | Attribute | Example selector |
   |---|---|---|
   | Best | `id` | `#revenue` |
   | Good | `name` | `[name='revenue']` |
   | OK | `placeholder` | `input[placeholder*='Revenue']` |
   | Fallback | visible text | `text=Save` |

6. Right-click the element → **Copy** → **Copy selector** as a starting point.
   Clean it up — long nth-child chains are fragile; short stable IDs are robust.

### Example (login page)

The login page at `/taxpayer/logincit` was inspected and the selectors are:

```json
{
  "login": {
    "emailField":    "#email",
    "passwordField": "#password",
    "submitButton":  "button[type='submit']"
  }
}
```

### What to inspect next

After logging in, visit each page below and copy selectors for all form fields:

| Page | What to capture |
|---|---|
| `/taxpayer/pending` | Row selector, Process button |
| `/taxpayer/sch?id=...` | Returning-currency radio, each numeric input, status dropdown, Proceed / Save / Submit buttons |

---

## 5. Preparing a Filing Payload

### Option A — Use the app's "Export TaxProMax (CIT) JSON" button (recommended)

1. Open the **nigeria-tax-calculator** app and enter your accounting data.
2. Go to **Reports → CIT Report**.
3. Click **Export TaxProMax (CIT) JSON** — this downloads `TaxProMax_CIT.json`
   with your computed CIT figures already populated.
4. Copy the file into the `rpa/` folder:

   ```bash
   cp ~/Downloads/TaxProMax_CIT.json rpa/TaxProMax_CIT.json
   ```

5. Run the transformer to create `filing.json`:

   ```bash
   cd rpa
   node transform.js                            # uses ./TaxProMax_CIT.json → ./filing.json
   # or provide explicit paths:
   node transform.js ~/Downloads/TaxProMax_CIT.json ./filing.json
   # or using the npm script:
   npm run transform
   ```

   The transformer reads the export and creates `filing.json` in the same directory.
   If the export already contains computed amounts (new app format), they are copied
   directly. If the export is a stub (no amounts), all fields are set to `0` for you
   to fill in manually.

6. Review `rpa/filing.json` and adjust any values if needed.

### Option B — Edit the sample payload manually

Edit `rpa/filing.sample.json` (or create `rpa/filing.json`) with your actual CIT figures:

```json
{
  "portal": "TaxProMax",
  "taxType": "CIT",
  "period": "2024",
  "tin": "12345678-0001",
  "businessName": "Your Business Ltd",
  "scheduleStatus": "Final",
  "amounts": {
    "revenue":                   5000000,
    "nonCurrentAssets":          2000000,
    "currentAsset":              1500000,
    "costOfSales":               3000000,
    "otherIncome":                200000,
    "operatingExpenses":          800000,
    "currentLiabilities":         600000,
    "longTermLiabilities":        400000,
    "ownershipCapitalStructure": 1000000,
    "reserve":                    300000,
    "profitAdjustment":                0,
    "balancingAdjustment":             0,
    "lossRelieved":                    0,
    "capitalAllowance":           150000
  }
}
```

Update `FILING_JSON=./filing.json` in your `.env` if you use a different file name.

> 🔒 `rpa/filing.json` is listed in `.gitignore`. Never commit real taxpayer data.

---

## 6. Running the Bot

All commands are run from inside the `rpa/` directory (or prefix with `cd rpa &&`).

### Review mode (default — safe)

```bash
node run.js
# or
npm run rpa:review
```

The bot will:
- Log in to TaxProMax (automated or manual pause if credentials not set)
- Navigate to Pending filings
- Click Process
- Open the CIT Schedule page
- Select the returning currency (radio button)
- Fill all configured numeric fields
- Click Save/Validate
- Click Proceed
- **Stop here — it will NOT click Submit**
- Save screenshots + a JSON log to `rpa/artifacts/<timestamp>/`

### Submit mode (auto-submit — use carefully)

```bash
RPA_MODE=submit node run.js
# or
npm run rpa:submit
```

> ⚠️ This will click the final **Submit** button. Ensure the selectors file has a
> real value for `sel.schedule.submitButton` and that all figures are correct.

### Skipping the Pending page (direct schedule URL)

If you already know the schedule ID:

```bash
TAXPROMAX_SCHEDULE_URL=https://taxpromax.firs.gov.ng/taxpayer/sch?id=21302371 node run.js
```

### Headless mode (no browser window)

```bash
HEADLESS=true node run.js
```

> ℹ️ Headless mode requires `TAXPROMAX_EMAIL` and `TAXPROMAX_PASSWORD` to be set.
> Manual login mode (`HEADLESS=true` without credentials) is not supported.

---

## 7. Understanding the Output (Artifacts)

Each run creates a timestamped directory: `rpa/artifacts/YYYY-MM-DD_HH-MM-SS/`

```
rpa/artifacts/2024-08-15_10-30-45/
  01-login-page.png          Login page before filling credentials
  02-post-login.png          Dashboard after successful login
  03-pending-page.png        Pending filings list
  04-after-process-click.png After clicking Process
  05-schedule-page.png       Schedule form before filling
  06-fields-filled.png       Schedule form after filling all fields
  07-after-save.png          After clicking Save/Validate
  08-after-proceed.png       After clicking Proceed
  09-review-stop.png         (review mode) Final state before Submit
  09-submitted.png           (submit mode) Confirmation page
  99-error.png               (if run failed) Error state
  run-log.json               Full step-by-step JSON log
```

`run-log.json` contains every step name, timestamp, field values written, and any errors.

---

## 8. Modes Reference

| Variable | Values | Default | Effect |
|---|---|---|---|
| `RPA_MODE` | `review` / `submit` | `review` | Controls whether final Submit is clicked |
| `HEADLESS` | `true` / `false` | `false` | `true` hides the browser window (required in CI) |
| `SLOW_MO` | number (ms) | `80` | Pause between actions; increase to debug |
| `TAXPROMAX_EMAIL` | string | _(none)_ | If blank, runner pauses for manual login |
| `TAXPROMAX_PASSWORD` | string | _(none)_ | If blank, runner pauses for manual login |

---

## 9. GitHub Actions (CI Review Run)

A workflow file (`.github/workflows/rpa-review.yml`) is included. It:

- Is triggered **only manually** via `workflow_dispatch` (not on push/PR)
- Always runs in **review mode** — it cannot submit
- Requires secrets to be configured in the repository settings
- Uploads all artifacts (screenshots + log) so you can download and inspect them

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `TAXPROMAX_EMAIL` | Your TaxProMax email |
| `TAXPROMAX_PASSWORD` | Your TaxProMax password |

### Running the workflow

1. Go to **Actions** → **TaxProMax RPA — Review Mode**
2. Click **Run workflow**
3. After it completes, download the `rpa-artifacts` zip from the run summary

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Manual login mode requires a visible browser` | `HEADLESS=true` with no credentials | Remove `HEADLESS=true` or set credentials in `.env` |
| `Login appears to have failed` | Wrong credentials or portal down | Verify credentials in browser first |
| `Timeout: element not found` | Selector is wrong or page not loaded | Update selectors; increase timeout or `SLOW_MO` |
| `submitButton not configured` | Running submit mode without real selector | Add `sel.schedule.submitButton` to your selectors file |
| Fields not filled | All `REPLACE_ME` placeholder selectors | Inspect the page in DevTools (see Section 4) |
| Bot fills wrong row | TIN/period not matching | Confirm `tin` and `period` in `filing.json` match portal data |
| CAPTCHA / OTP screen appears | TaxProMax MFA | Switch to manual login mode (omit credentials) and complete CAPTCHA yourself |
| Runner hangs waiting for Enter | Manual login mode active | Complete login in browser then press Enter in the terminal |
| `Input file not found: ./TaxProMax_CIT.json` | transform.js can't find export | Copy `TaxProMax_CIT.json` into `rpa/` or pass full path to `node transform.js` |

---

## 11. Safety & Disclaimer

- **CAPTCHA and MFA cannot be bypassed.** The runner will open a browser and pause for
  manual completion. Never store OTP codes or bypass tokens in code or environment files.
- **This automation can break** if TaxProMax changes its UI (selector changes, URL changes,
  new CAPTCHA). Monitor for portal updates and re-inspect selectors when the bot starts
  failing.
- **Always run in review mode first.** Check every screenshot before enabling submit mode.
- **Keep credentials secret.** Never commit `rpa/.env`, `rpa/filing.json`, or any
  `*.auth.json` / `*.storageState.json` files to version control (all are in `.gitignore`).
- **No liability.** This tool is provided as-is. The repo owners and contributors are not
  responsible for incorrect or missed filings caused by automation errors.
- The bot is designed for **human-assisted workflows** — a human should review the
  artifacts after every review-mode run and before any submit-mode run.
