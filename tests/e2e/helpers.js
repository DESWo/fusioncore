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

/**
 * Freeze the simulation. Skipping the tutorial leaves the sim running at 1x
 * with the mission-1 baseline settings applied, and those settings complete
 * First Light hands-free in about five real seconds - so any test asserting
 * static mission-1 UI must pause first or it races the mission itself.
 * Space is the pause shortcut; it beats a button click here because it needs
 * no locator resolution, which under CI worker contention can take longer
 * than the mission does. The paused pill then confirms the freeze landed.
 */
export async function pauseSim(page) {
  await page.keyboard.press('Space');
  await expect(page.getByText(/paused \/ press 1x or space/i)).toBeVisible();
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
// Containment. Two layers, because the obvious document-level check is nearly
// vacuous here: both app roots are overflow-hidden and the dashboard scroller
// is overflow-y-auto (which computes overflow-x to auto), so a grid blowout
// scrolls or clips INSIDE the column without ever widening document/body
// scrollWidth. The historical bug - a max-content grid track stretching every
// panel past a phone viewport - reproduces with the document numbers
// unchanged. The real guard is expectDashboardContained, which measures the
// dashboard scroller itself and the boxes of its children.

/** Belt: document/body must not scroll horizontally (catches portal blowouts). */
export async function expectNoPageOverflow(page, label) {
  const o = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(o.scrollWidth, `${label}: document must not overflow horizontally`).toBeLessThanOrEqual(o.clientWidth);
  expect(o.bodyScrollWidth, `${label}: body must not overflow horizontally`).toBeLessThanOrEqual(o.clientWidth);
}

/**
 * The guard with teeth: the dashboard's scroll column must not scroll
 * horizontally, and every panel in it must sit fully inside the viewport.
 * This is exactly the measurement that catches the minmax(0,1fr) regression:
 * with the fix removed, the grid track goes max-content, panel boxes exceed
 * the viewport, and both assertions here fail at 375px.
 */
export async function expectDashboardContained(page, label) {
  const scroller = page.locator('section[aria-label="Controls and diagnostics"] [class*="overflow-y-auto"]').first();
  await expect(scroller, `${label}: the dashboard scroll column exists`).toBeVisible();
  const m = await scroller.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    childOverhang: Math.max(0, ...Array.from(el.children).map(
      (c) => Math.ceil(c.getBoundingClientRect().right - document.documentElement.clientWidth),
    )),
  }));
  expect(m.scrollWidth, `${label}: the dashboard column must not scroll horizontally`)
    .toBeLessThanOrEqual(m.clientWidth + 1);
  expect(m.childOverhang, `${label}: every dashboard panel stays inside the viewport (overhang px)`)
    .toBeLessThanOrEqual(1);
}

/**
 * A named critical control must sit fully inside the viewport, never clipped.
 * Fusion's is the .estop; fission has no EmergencyStop component (its SCRAM
 * only renders while critical), so its tests pass the rod slider instead -
 * the control a fission operator can least afford to lose off-screen.
 */
export async function expectControlReachable(page, locator, label) {
  await expect(locator, `${label} is visible`).toBeVisible();
  const bb = await locator.boundingBox();
  const vw = page.viewportSize().width;
  expect(bb.x, `${label} left edge inside viewport`).toBeGreaterThanOrEqual(0);
  expect(bb.x + bb.width, `${label} right edge inside ${vw}px viewport`).toBeLessThanOrEqual(vw + 0.5);
}

/** The emergency stop must sit fully inside the viewport, never clipped. */
export async function expectEstopReachable(page) {
  await expectControlReachable(page, page.locator('.estop'), 'E-stop');
}
