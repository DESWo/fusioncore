import { test as base, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Console/error gate.
//
// Every test in this suite fails if the page throws an uncaught exception or
// logs a console error. The gate is an auto fixture, so no spec has to opt in
// and none can quietly opt out.
//
// Allowlist policy: entries must be justified inline, and each one must match
// something the application does not control. Do not add entries to make a
// red test green; fix the application instead.
const CONSOLE_ERROR_ALLOWLIST = [
  // (empty) - the app currently boots with a clean console in headless
  // chromium against the production build. Keep it that way.
];

function isAllowlisted(text) {
  return CONSOLE_ERROR_ALLOWLIST.some((re) => re.test(text));
}

export const test = base.extend({
  consoleGate: [
    async ({ page }, use) => {
      const failures = [];
      page.on('pageerror', (err) => {
        failures.push(`uncaught page exception: ${err.message}`);
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isAllowlisted(msg.text())) {
          failures.push(`console.error: ${msg.text()}`);
        }
      });
      // A chunk that fails to load surfaces as a failed request for a .js
      // asset plus a pageerror; catching the request too names the file.
      page.on('requestfailed', (req) => {
        if (/\.(js|css)(\?|$)/.test(req.url())) {
          failures.push(`asset failed to load: ${req.url()} (${req.failure()?.errorText})`);
        }
      });
      await use(failures);
      expect(failures, 'the page must produce no uncaught errors, console errors, or failed asset loads').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

// ---------------------------------------------------------------------------
// Navigation helpers. These drive the real UI the way a player does - through
// visible buttons - so a broken menu fails the suite even before a spec's own
// assertions run.

export async function gotoTitle(page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /start \/ first light|new campaign/i })).toBeVisible();
}

/** Title -> machine chooser. */
export async function openMachineChooser(page) {
  await page.getByRole('button', { name: /start \/ first light|new campaign/i }).click();
  await expect(page.getByRole('button', { name: /fusion tokamak/i })).toBeVisible();
}

/** Start a fresh campaign in the given mode at Operator difficulty. */
export async function startCampaign(page, machine) {
  await gotoTitle(page);
  await openMachineChooser(page);
  const machineButton = {
    fusion: /fusion tokamak/i,
    fission: /fission pwr/i,
    career: /engineering career/i,
  }[machine];
  await page.getByRole('button', { name: machineButton }).click();
  if (machine !== 'career') {
    // career goes straight to character creation; reactors pick a difficulty
    await page.getByRole('button', { name: /operator/i }).click();
  }
}

/** Dismiss the mission-1 tutorial checklist if it is showing. */
export async function skipTutorial(page) {
  const skip = page.getByRole('button', { name: /^skip$/i });
  await expect(skip).toBeVisible();
  await skip.click();
}

/** Read the sim clock ("T+0H 05M") out of the HUD. */
export async function readSimClock(page) {
  const hud = page.locator('header');
  const text = await hud.innerText();
  const m = /T\+\S+\s+\S+/.exec(text);
  expect(m, `HUD should show a T+ sim clock (got: ${text.slice(0, 120)})`).toBeTruthy();
  return m[0];
}

// ---------------------------------------------------------------------------
// Containment: the page itself must never scroll horizontally. Individual
// widgets (the mission-chip row) are allowed internal overflow-x scrolling -
// that is their design - but the document and the dashboard column are not.

export async function expectNoPageOverflow(page, label) {
  const o = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(o.scrollWidth, `${label}: document must not overflow horizontally`).toBeLessThanOrEqual(o.clientWidth);
  expect(o.bodyScrollWidth, `${label}: body must not overflow horizontally`).toBeLessThanOrEqual(o.clientWidth);
}

/** The emergency stop must sit fully inside the viewport, never clipped. */
export async function expectEstopReachable(page) {
  const estop = page.locator('.estop');
  await expect(estop).toBeVisible();
  const bb = await estop.boundingBox();
  const vw = page.viewportSize().width;
  expect(bb.x, 'E-stop left edge inside viewport').toBeGreaterThanOrEqual(0);
  expect(bb.x + bb.width, `E-stop right edge inside ${vw}px viewport`).toBeLessThanOrEqual(vw + 0.5);
}
