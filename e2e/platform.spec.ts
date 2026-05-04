import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDEE FLOWS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Attendee Discovery', () => {
  test('browse page loads with hero and search filters', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('h1')).toContainText('Events Near You');
    await expect(page.locator('input[name="search"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('select[name="city"]')).toBeVisible();
    await expect(page.locator('select[name="sort"]')).toBeVisible();
  });

  test('city filter updates URL and page', async ({ page }) => {
    await page.goto('/events');
    await page.selectOption('select[name="city"]', 'Calgary');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/city=Calgary/);
  });

  test('sort filter works', async ({ page }) => {
    await page.goto('/events');
    await page.selectOption('select[name="sort"]', 'popular');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/sort=popular/);
  });

  test('search + clear filter works', async ({ page }) => {
    await page.goto('/events?search=test');
    const clearLink = page.getByRole('link', { name: 'Clear' }).first();
    await expect(clearLink).toBeVisible();
    await clearLink.click();
    await expect(page).toHaveURL('/events');
  });

  test('event cards are shown in a grid', async ({ page }) => {
    await page.goto('/events');
    // Grid exists even if no events
    const grid = page.locator('.grid, [class*="grid"]').first();
    await expect(grid).toBeVisible();
  });
});

test.describe('Event Detail Page — Attendee', () => {
  test('public event page loads', async ({ page }) => {
    // Navigate to browse and try to click first event if any
    await page.goto('/events');
    const firstCard = page.locator('a[href^="/event/"]').first();
    const count = await firstCard.count();
    if (count > 0) {
      const href = await firstCard.getAttribute('href');
      await page.goto(href!);
      await expect(page.locator('h1')).toBeVisible();
    } else {
      // No events live — verify page still loads
      await expect(page.locator('text=No events found')).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH FLOWS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sign In|Login|Gatewise/i);
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test('unauthenticated dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login|\/$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// STATIC / COMPLIANCE PAGES
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Static Pages', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, [class*="hero"]').first()).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    const res = await page.goto('/privacy');
    expect(res?.status()).toBeLessThan(500);
  });

  test('404 page is branded', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz');
    // Next.js dev serves /_not-found route for unknown paths
    await expect(page.locator('text=404').or(page.locator('h1')).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE RESPONSIVENESS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mobile UX', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('browse page is responsive on mobile', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[name="search"]')).toBeVisible();
    // No horizontal overflow
    const body = await page.evaluate(() => document.body.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(body).toBeLessThanOrEqual(viewport + 5);
  });

  test('homepage is responsive on mobile', async ({ page }) => {
    await page.goto('/');
    const body = await page.evaluate(() => document.body.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(body).toBeLessThanOrEqual(viewport + 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE / TECHNICAL
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Performance & Technical', () => {
  test('security headers are set', async ({ page }) => {
    const res = await page.goto('/');
    const headers = res?.headers() ?? {};
    expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known benign errors
    const critical = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error') && !e.includes('hydrat')
    );
    expect(critical).toHaveLength(0);
  });

  test('no console errors on browse page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    const critical = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error') && !e.includes('hydrat')
    );
    expect(critical).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZER FLOW (logged-in required — skipped if no test credentials)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Organizer Dashboard', () => {
  test.skip(!process.env.TEST_EMAIL, 'Skipped: TEST_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  });

  test('dashboard home shows stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[class*="stat"], [class*="card"]').first()).toBeVisible();
  });

  test('dashboard mobile nav opens and closes', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    await page.goto('/dashboard');
    const hamburger = page.getByRole('button', { name: /open navigation/i });
    await hamburger.click();
    await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible();
    await page.getByRole('button', { name: /close menu/i }).click();
    await expect(page.getByRole('navigation', { name: /main navigation/i })).not.toBeVisible();
  });

  test('create event button is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    const btn = page.getByRole('link', { name: /create|new event/i }).first();
    await expect(btn).toBeVisible();
  });
});
