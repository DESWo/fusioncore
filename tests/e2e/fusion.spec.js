import {
  test, expect, startCampaign, skipTutorial, readSimClock,
  expectNoPageOverflow, expectEstopReachable,
} from './helpers.js';

// The primary gameplay loop, proven end to end: boot, render, control, run,
// and actually complete Mission 1. Mission requirements beyond that are the
// balance suite's job, not this one's.
test.describe('fusion campaign', () => {
  test('boots into Mission 1 with a rendered dashboard', async ({ page }) => {
    await startCampaign(page, 'fusion');
    await skipTutorial(page);

    // Mission interface
    await expect(page.getByText(/mission 1: first light/i).first()).toBeVisible();
    await expect(page.getByText(/hold a stable plasma/i).first()).toBeVisible();

    // Core controls exist and are interactive range inputs
    const field = page.locator('#ctl-B');
    const heat = page.locator('#ctl-heat');
    await expect(field).toBeVisible();
    await expect(heat).toBeVisible();
    await expect(field).toBeEnabled();
    await expect(heat).toBeEnabled();

    // Alarm board and E-stop render
    await expect(page.getByText(/annunciator/i).first()).toBeVisible();
    await expectEstopReachable(page);
    await expectNoPageOverflow(page, 'fusion dashboard');
  });

  test('simulation runs, the clock advances, and Mission 1 completes', async ({ page }) => {
    await startCampaign(page, 'fusion');
    await skipTutorial(page);

    // The mission brief's own settings: field 6 T, heating 15 MW.
    await page.locator('#ctl-B').fill('6');
    await page.locator('#ctl-heat').fill('15');

    const t0 = await readSimClock(page);
    await page.getByRole('button', { name: /^8x/ }).click();

    // The sim clock must move: proves the worker loop ticks the engine.
    await expect(async () => {
      expect(await readSimClock(page)).not.toBe(t0);
    }).toPass({ timeout: 10_000 });

    // Holding 1.5 keV for the sustain window completes First Light.
    await expect(page.getByText(/mission 1 complete/i)).toBeVisible({ timeout: 45_000 });

    // The completion cutscene offers the next mission; the loop continues.
    await page.getByRole('button', { name: /begin mission/i }).click();
    await expect(page.getByText(/heating up/i).first()).toBeVisible();
  });
});
