import {
  test, expect, startCampaign, skipTutorial, pauseSim,
  expectNoPageOverflow, expectDashboardContained, expectEstopReachable, expectControlReachable,
} from './helpers.js';

// Containment guard. The specific regression this exists for: the dashboard
// scroll container is a single-column CSS grid, and without an explicit
// minmax(0,1fr) column its track sizes to max-content. One wide child (the
// campaign map row) then stretched every panel past the phone viewport and
// pushed the emergency stop off screen. Both dashboards use the identical
// container, so both are measured - with expectDashboardContained, which
// inspects the column itself; the document-level check alone cannot fail for
// this class of bug (the app's roots clip their own overflow).
//
// Intentional internal scrollers (the mission-chip row has overflow-x-auto by
// design) are allowed to scroll inside their own box; their BOX must still
// sit inside the viewport.
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
    await expectDashboardContained(page, 'fusion dashboard');
    await expectEstopReachable(page);

    // The mission-chip row (inside the dashboard section, not the TopHUD,
    // which is also overflow-x-auto): its box stays inside the viewport, and
    // any content wider than the box scrolls internally rather than widening
    // the panel - the exact mechanism the historical bug defeated.
    const chipRow = page.locator('section[aria-label="Controls and diagnostics"] .overflow-x-auto').first();
    await expect(chipRow).toBeVisible();
    await expectControlReachable(page, chipRow, 'mission chip row');
  });

  test('fission dashboard is contained and the rod slider stays reachable', async ({ page }) => {
    await startCampaign(page, 'fission');
    await skipTutorial(page);
    await pauseSim(page);
    await expectNoPageOverflow(page, 'fission dashboard');
    await expectDashboardContained(page, 'fission dashboard');
    // Fission has no persistent E-stop widget (SCRAM renders only while
    // critical); the rod slider is the critical control that must never be
    // pushed off screen.
    await expectControlReachable(page, page.locator('#ctl-rods'), 'rod slider');
  });
});
