import { defineConfig } from '@playwright/test';

// Browser smoke layer. This proves what the node suites cannot: that the
// built application actually boots, renders, and stays usable in a real
// browser at real viewport sizes. It is deliberately a smoke suite, not an
// end-to-end test of every mechanic; the physics and game logic are already
// covered headlessly by scripts/*.mjs, which run the same engine modules.
//
// Tests run against the production build via `vite preview` (port 4173, so a
// dev server on 5199 can keep running alongside). `npm run test:e2e` builds
// first; CI builds in its own step and runs `playwright test` directly.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false, // one preview server, few tests; ordering keeps output readable
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // one retry in CI absorbs slow-runner flake; locally flake should be visible
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    // Full smoke at desktop width.
    {
      name: 'desktop-1280',
      use: { viewport: { width: 1280, height: 800 } },
    },
    // Phone width: the class of bug this guards (a grid max-content column
    // blowing the dashboard past the viewport) only reproduces below lg, so
    // the fusion boot and the containment spec both run here.
    {
      name: 'mobile-375',
      use: { viewport: { width: 375, height: 812 }, hasTouch: true },
      testMatch: /(containment|fusion)\.spec\.js/,
    },
    // Narrowest supported width: containment only.
    {
      name: 'narrow-320',
      use: { viewport: { width: 320, height: 720 }, hasTouch: true },
      testMatch: /containment\.spec\.js/,
    },
  ],
});
