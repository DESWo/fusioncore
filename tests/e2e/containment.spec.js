import {
  test, expect, startCampaign, skipTutorial, pauseSim,
  expectNoPageOverflow, expectEstopReachable,
} from './helpers.js';

// Containment guard. The specific regression this exists for: the dashboard
// scroll container is a single-column CSS grid, and without an explicit
// minmax(0,1fr) column its track sizes to max-content. One wide child (the
// campaign map row) then stretched every panel past the phone viewport and
// pushed the emergency stop off screen. That is a class of bug the node
// suites can never see; this spec fails on any recurrence at any width.
//
// Intentional internal scrollers (the mission-chip row has overflow-x-auto by
// design) are allowed to scroll inside their own box - the assertions here are
// about the document and the E-stop, not about widgets.
test.describe('viewport containment', () => {
  test('title screen does not overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /start \/ first light|new campaign/i })).toBeVisible();
    await expectNoPageOverflow(page, 'title');
  });

  test('fusion dashboard is contained and the E-stop stays reachable', async ({ page }) => {
    await startCampaign(page, 'fusion');
    await skipTutorial(page);
    await pauseSim(page); // keep mission-1 UI stable while measuring
    await expectNoPageOverflow(page, 'fusion dashboard');
    await expectEstopReachable(page);

    // The mission-chip row is the widest child; prove it scrolls internally
    // instead of widening the page (guards the exact historical failure mode).
    const chipRow = page.locator('.overflow-x-auto').first();
    if (await chipRow.count()) {
      const { scrollWidth, clientWidth } = await chipRow.evaluate((el) => ({
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      }));
      expect(scrollWidth, 'chip row keeps its content').toBeGreaterThan(0);
      expect(clientWidth, 'chip row is clamped to its column').toBeLessThanOrEqual(
        page.viewportSize().width,
      );
    }
  });

  test('fission dashboard is contained', async ({ page }) => {
    await startCampaign(page, 'fission');
    await skipTutorial(page);
    await expectNoPageOverflow(page, 'fission dashboard');
  });
});
