import { test, expect, gotoTitle, openMachineChooser } from './helpers.js';

test.describe('title screen', () => {
  test('loads with a clean console and offers all three machines', async ({ page }) => {
    await gotoTitle(page);
    await expect(page.getByText(/confine a star/i).first()).toBeVisible();

    await openMachineChooser(page);
    // All three modes must be reachable from a fresh install.
    await expect(page.getByRole('button', { name: /fusion tokamak/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /fission pwr/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /engineering career/i })).toBeVisible();

    // Difficulty select appears for a reactor campaign.
    await page.getByRole('button', { name: /fusion tokamak/i }).click();
    await expect(page.getByRole('button', { name: /operator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /engineer/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /director/i })).toBeVisible();
  });
});
