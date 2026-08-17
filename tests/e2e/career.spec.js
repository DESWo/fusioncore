import { test, expect, startCampaign } from './helpers.js';

// Character creation through to the running life sim. The career engine's own
// rules (probability tables, event resolution, seeded runs to 65) are covered
// by scripts/career_check.mjs; this proves the actual UI can produce a
// playable character and enter the simulation.
test.describe('career mode', () => {
  test('creates a character and enters the year-one simulation', async ({ page }) => {
    await startCampaign(page, 'career');
    await expect(page.getByRole('heading', { name: /who you are/i })).toBeVisible();

    // Name, then a deterministic 25-point spread: +5 on every trait.
    await page.locator('#cname').fill('Test Engineer');
    for (const trait of ['Smarts', 'Intuition', 'Charisma', 'Grit', 'Connections']) {
      const plus = page.getByRole('button', { name: `Raise ${trait}` });
      for (let i = 0; i < 5; i++) await plus.click();
    }
    await expect(page.getByText(/^0 left$/)).toBeVisible();
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page.getByRole('heading', { name: /how you're known/i })).toBeVisible();
    await page.getByRole('button', { name: /prefer not to say/i }).click();
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page.getByRole('heading', { name: /where you started/i })).toBeVisible();
    // Power plant town: GR +2, SM +1 on top of the allocation.
    await page.getByRole('button', { name: /power plant town/i }).click();
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page.getByRole('heading', { name: /why fusion/i })).toBeVisible();
    await page.getByRole('button', { name: /pure science/i }).click();
    await page.getByRole('button', { name: /begin at eighteen/i }).click();

    // In the sim: the character sheet must reflect exactly what was chosen.
    // Base 1 + 5 allocated = 6 per trait, then the background's GR+2 SM+1.
    const hud = page.locator('body');
    await expect(hud.getByText('Test Engineer').first()).toBeVisible();
    await expect(hud.getByText(/undergraduate/i).first()).toBeVisible();
    const text = await page.locator('body').innerText();
    for (const [label, value] of [
      ['SMARTS', 7], ['INTUITION', 6], ['CHARISMA', 6], ['GRIT', 8], ['CONNECTIONS', 6],
    ]) {
      const re = new RegExp(`${label}\\s*\\n\\s*${value}\\b`, 'i');
      expect(text, `${label} should be ${value} after allocation + background`).toMatch(re);
    }

    // And the year-one planning interface is live: the sim has actually begun.
    await expect(page.getByText(/the year ahead/i).first()).toBeVisible();
  });
});
