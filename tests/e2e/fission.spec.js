import { test, expect, startCampaign, skipTutorial, pauseSim, readSimClock } from './helpers.js';

test.describe('fission campaign', () => {
  test('boots, renders the control surface, and the reactor responds to rods', async ({ page }) => {
    await startCampaign(page, 'fission');
    await skipTutorial(page);
    await pauseSim(page);

    // Fission mission interface
    await expect(page.getByText(/criticality/i).first()).toBeVisible();

    // Exercise a meaningful control: a modest rod withdrawal. Deliberately
    // NOT a big pull - yanking rods 100 -> 60 in one step from cold shutdown
    // is a reactivity excursion, and the game correctly punishes it with a
    // prompt-criticality failure some of the time (the SL-1 lesson). A smoke
    // test operates the plant properly; recklessness is the balance suite's
    // subject, not this one's.
    const rods = page.locator('#ctl-rods');
    await expect(rods).toBeVisible();
    await expect(rods).toBeEnabled();
    const before = await rods.inputValue();
    await rods.fill('90');
    expect(await rods.inputValue()).not.toBe(before);

    // Run the sim and prove the loop ticks in fission mode too. 2x, not 8x:
    // the fission scene plus an 80 Hz tick rate can saturate the page's main
    // thread on a loaded CI machine until it stops servicing driver calls at
    // all; 2x proves the loop just as well without starving the renderer. If
    // a Priority-1 advisory fires, it freezes the sim until acknowledged
    // (spec section 9) - the test acknowledges and carries on like an operator.
    const t0 = await readSimClock(page);
    await page.getByRole('button', { name: /set simulation speed 2x/i }).click();
    await expect(async () => {
      const ack = page.getByRole('button', { name: /acknowledge: resume operations/i });
      if (await ack.isVisible()) await ack.click();
      expect(await readSimClock(page)).not.toBe(t0);
    }).toPass({ timeout: 15_000 });
  });
});
