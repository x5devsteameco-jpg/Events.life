# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: platform.spec.ts >> Event Detail Page — Attendee >> public event page loads
- Location: e2e/platform.spec.ts:48:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1')
Expected: visible
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="text-3xl sm:text-4xl font-black text-[#e8f4f8] leading-tight">Green Leaf Cannabis Networking Night</h1> aka getByRole('heading', { name: 'Green Leaf Cannabis Networking Night', exact: true })
    2) <h1 class="text-3xl sm:text-4xl font-black text-[#e8f4f8] leading-tight">Green Leaf Cannabis Networking Night</h1> aka getByText('Green Leaf Cannabis').nth(3)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - link "Gatewise Events" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]:
          - img [ref=e7]
          - generic [ref=e11]: Gatewise Events
      - generic [ref=e12]:
        - button "Share this event" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
          - text: Share
        - generic [ref=e20]: LIVE
    - generic [ref=e21]:
      - generic [ref=e22]:
        - img [ref=e23]
        - img [ref=e26]
      - generic [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]: Live
          - generic [ref=e33]: Industry Event
        - heading "Green Leaf Cannabis Networking Night" [level=1] [ref=e34]
        - paragraph [ref=e35]: Hosted by Jordan Westbrook
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e41]:
          - generic [ref=e42]: J
          - generic [ref=e43]:
            - paragraph [ref=e44]: Jordan Westbrook
            - paragraph [ref=e45]: Brand Manager · Green Leaf Cannabis Co.
          - link "Profile →" [ref=e46] [cursor=pointer]:
            - /url: /organizer/cmoq78e71000004kyu8cj4bvk
        - generic [ref=e48]:
          - generic [ref=e49]:
            - paragraph [ref=e50]: Date & Time
            - paragraph [ref=e51]: Jun 15, 2026
          - generic [ref=e52]:
            - paragraph [ref=e53]: Location
            - paragraph [ref=e54]: The Emerald Lounge
            - link "View on Maps ↗" [ref=e55] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=The%20Emerald%20Lounge
        - generic [ref=e59]: 2 / 50 attending
      - generic [ref=e62]:
        - generic [ref=e63]:
          - heading "RSVP to Green Leaf Cannabis Networking Night" [level=3] [ref=e64]
          - paragraph [ref=e65]: Free event · Takes 30 seconds
        - generic [ref=e66]:
          - generic [ref=e67]:
            - generic [ref=e68]: Full Name *
            - textbox "Full Name *" [ref=e70]:
              - /placeholder: Jane Doe
          - generic [ref=e71]:
            - generic [ref=e72]: Email Address *
            - textbox "Email Address *" [ref=e74]:
              - /placeholder: jane@example.com
          - generic [ref=e75]:
            - generic [ref=e76]: Store Name
            - textbox "Store Name" [ref=e78]:
              - /placeholder: e.g. The Green Room Dispensary
          - generic [ref=e79]:
            - generic [ref=e80]: Store Address
            - textbox "Store Address" [ref=e82]:
              - /placeholder: 123 Main St, Vancouver, BC
          - generic [ref=e83]:
            - generic [ref=e84]: Brand / Company
            - textbox "Brand / Company" [ref=e86]:
              - /placeholder: e.g. Acme Cannabis Co.
          - generic [ref=e87]:
            - generic [ref=e88]: Position / Title
            - textbox "Position / Title" [ref=e90]:
              - /placeholder: e.g. Store Manager
          - generic [ref=e91]:
            - checkbox "I agree to receive event updates and promotional emails from the organizer. You can unsubscribe at any time. Consent not required to RSVP." [ref=e92] [cursor=pointer]
            - generic [ref=e93] [cursor=pointer]: I agree to receive event updates and promotional emails from the organizer. You can unsubscribe at any time. Consent not required to RSVP.
          - button "Submit RSVP" [ref=e94] [cursor=pointer]
          - paragraph [ref=e95]:
            - text: By submitting, you agree to our
            - link "Privacy Policy" [ref=e96] [cursor=pointer]:
              - /url: /privacy
            - text: . Your data is protected under PIPEDA.
  - generic "Notifications"
  - button "Open Next.js Dev Tools" [ref=e102] [cursor=pointer]:
    - img [ref=e103]
  - alert [ref=e106]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ─────────────────────────────────────────────────────────────────────────────
  4   | // ATTENDEE FLOWS
  5   | // ─────────────────────────────────────────────────────────────────────────────
  6   | 
  7   | test.describe('Attendee Discovery', () => {
  8   |   test('browse page loads with hero and search filters', async ({ page }) => {
  9   |     await page.goto('/events');
  10  |     await expect(page.locator('h1')).toContainText('Events Near You');
  11  |     await expect(page.locator('input[name="search"]')).toBeVisible();
  12  |     await expect(page.locator('select[name="category"]')).toBeVisible();
  13  |     await expect(page.locator('select[name="city"]')).toBeVisible();
  14  |     await expect(page.locator('select[name="sort"]')).toBeVisible();
  15  |   });
  16  | 
  17  |   test('city filter updates URL and page', async ({ page }) => {
  18  |     await page.goto('/events');
  19  |     await page.selectOption('select[name="city"]', 'Calgary');
  20  |     await page.click('button[type="submit"]');
  21  |     await expect(page).toHaveURL(/city=Calgary/);
  22  |   });
  23  | 
  24  |   test('sort filter works', async ({ page }) => {
  25  |     await page.goto('/events');
  26  |     await page.selectOption('select[name="sort"]', 'popular');
  27  |     await page.click('button[type="submit"]');
  28  |     await expect(page).toHaveURL(/sort=popular/);
  29  |   });
  30  | 
  31  |   test('search + clear filter works', async ({ page }) => {
  32  |     await page.goto('/events?search=test');
  33  |     const clearLink = page.getByRole('link', { name: 'Clear' }).first();
  34  |     await expect(clearLink).toBeVisible();
  35  |     await clearLink.click();
  36  |     await expect(page).toHaveURL('/events');
  37  |   });
  38  | 
  39  |   test('event cards are shown in a grid', async ({ page }) => {
  40  |     await page.goto('/events');
  41  |     // Grid exists even if no events
  42  |     const grid = page.locator('.grid, [class*="grid"]').first();
  43  |     await expect(grid).toBeVisible();
  44  |   });
  45  | });
  46  | 
  47  | test.describe('Event Detail Page — Attendee', () => {
  48  |   test('public event page loads', async ({ page }) => {
  49  |     // Navigate to browse and try to click first event if any
  50  |     await page.goto('/events');
  51  |     const firstCard = page.locator('a[href^="/event/"]').first();
  52  |     const count = await firstCard.count();
  53  |     if (count > 0) {
  54  |       const href = await firstCard.getAttribute('href');
  55  |       await page.goto(href!);
> 56  |       await expect(page.locator('h1')).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  57  |     } else {
  58  |       // No events live — verify page still loads
  59  |       await expect(page.locator('text=No events found')).toBeVisible();
  60  |     }
  61  |   });
  62  | });
  63  | 
  64  | // ─────────────────────────────────────────────────────────────────────────────
  65  | // AUTH FLOWS
  66  | // ─────────────────────────────────────────────────────────────────────────────
  67  | 
  68  | test.describe('Authentication', () => {
  69  |   test('login page renders', async ({ page }) => {
  70  |     await page.goto('/login');
  71  |     await expect(page).toHaveTitle(/Sign In|Login|Gatewise/i);
  72  |     await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  73  |   });
  74  | 
  75  |   test('register page renders', async ({ page }) => {
  76  |     await page.goto('/register');
  77  |     await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  78  |   });
  79  | 
  80  |   test('unauthenticated dashboard redirects to login', async ({ page }) => {
  81  |     await page.goto('/dashboard');
  82  |     await expect(page).toHaveURL(/login|\/$/);
  83  |   });
  84  | });
  85  | 
  86  | // ─────────────────────────────────────────────────────────────────────────────
  87  | // STATIC / COMPLIANCE PAGES
  88  | // ─────────────────────────────────────────────────────────────────────────────
  89  | 
  90  | test.describe('Static Pages', () => {
  91  |   test('homepage loads', async ({ page }) => {
  92  |     await page.goto('/');
  93  |     await expect(page.locator('h1, [class*="hero"]').first()).toBeVisible();
  94  |   });
  95  | 
  96  |   test('privacy page loads', async ({ page }) => {
  97  |     const res = await page.goto('/privacy');
  98  |     expect(res?.status()).toBeLessThan(500);
  99  |   });
  100 | 
  101 |   test('404 page is branded', async ({ page }) => {
  102 |     await page.goto('/this-page-does-not-exist-xyz');
  103 |     // Next.js dev serves /_not-found route for unknown paths
  104 |     await expect(page.locator('text=404').or(page.locator('h1')).first()).toBeVisible();
  105 |   });
  106 | });
  107 | 
  108 | // ─────────────────────────────────────────────────────────────────────────────
  109 | // MOBILE RESPONSIVENESS
  110 | // ─────────────────────────────────────────────────────────────────────────────
  111 | 
  112 | test.describe('Mobile UX', () => {
  113 |   test.use({ viewport: { width: 390, height: 844 } });
  114 | 
  115 |   test('browse page is responsive on mobile', async ({ page }) => {
  116 |     await page.goto('/events');
  117 |     await expect(page.locator('h1')).toBeVisible();
  118 |     await expect(page.locator('input[name="search"]')).toBeVisible();
  119 |     // No horizontal overflow
  120 |     const body = await page.evaluate(() => document.body.scrollWidth);
  121 |     const viewport = await page.evaluate(() => window.innerWidth);
  122 |     expect(body).toBeLessThanOrEqual(viewport + 5);
  123 |   });
  124 | 
  125 |   test('homepage is responsive on mobile', async ({ page }) => {
  126 |     await page.goto('/');
  127 |     const body = await page.evaluate(() => document.body.scrollWidth);
  128 |     const viewport = await page.evaluate(() => window.innerWidth);
  129 |     expect(body).toBeLessThanOrEqual(viewport + 5);
  130 |   });
  131 | });
  132 | 
  133 | // ─────────────────────────────────────────────────────────────────────────────
  134 | // PERFORMANCE / TECHNICAL
  135 | // ─────────────────────────────────────────────────────────────────────────────
  136 | 
  137 | test.describe('Performance & Technical', () => {
  138 |   test('security headers are set', async ({ page }) => {
  139 |     const res = await page.goto('/');
  140 |     const headers = res?.headers() ?? {};
  141 |     expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy();
  142 |     expect(headers['x-content-type-options']).toBe('nosniff');
  143 |   });
  144 | 
  145 |   test('no console errors on homepage', async ({ page }) => {
  146 |     const errors: string[] = [];
  147 |     page.on('console', (msg) => {
  148 |       if (msg.type() === 'error') errors.push(msg.text());
  149 |     });
  150 |     await page.goto('/');
  151 |     await page.waitForLoadState('networkidle');
  152 |     // Filter out known benign errors
  153 |     const critical = errors.filter(
  154 |       (e) => !e.includes('ResizeObserver') && !e.includes('Non-Error') && !e.includes('hydrat')
  155 |     );
  156 |     expect(critical).toHaveLength(0);
```