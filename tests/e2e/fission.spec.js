import { test, expect, startCampaign, skipTutorial, readSimClock } from './helpers.js';

test.describe('fission campaign', () => {
  test('boots, renders the control surface, and the reactor responds to rods', async ({ page }) => {
    await startCampaign(page, 'fission');
    await skipTutorial(page);

    // Fission mission interface
    await expect(page.getByText(/criticality/i).first()).toBeVisible();

    // Exercise a meaningful control: withdraw rods, which is the first thing
    // the mission itself asks for. The rod slider is the fission ControlSlider.
    const rods = page.locator('#ctl-rods');
    await expect(rods).toBeVisible();
    await expect(rods).toBeEnabled();
    const before = await rods.inputValue();
    await rods.fill('60');
    expect(await rods.inputValue()).not.toBe(before);

    // Run the sim and prove the loop ticks in fission mode too.
    const t0 = await readSimClock(page);
    await page.getByRole('button', { name: /set simulation speed 8x/i }).click();
    await expect(async () => {
      expect(await readSimClock(page)).not.toBe(t0);
    }).toPass({ timeout: 10_000 });
  });
});
