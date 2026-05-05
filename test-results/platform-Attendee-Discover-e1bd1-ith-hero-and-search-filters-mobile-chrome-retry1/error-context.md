# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: platform.spec.ts >> Attendee Discovery >> browse page loads with hero and search filters
- Location: e2e/platform.spec.ts:8:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="search"]')
Expected: visible
Error: strict mode violation: locator('input[name="search"]') resolved to 2 elements:
    1) <input name="search" placeholder="Search events…" class="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"/> aka getByRole('textbox', { name: 'Search events…' })
    2) <input name="search" placeholder="Search events…" class="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[#e8f4f8] outline-none focus:ring-2 focus:ring-[rgba(0,229,204,0.3)] transition-all"/> aka getByPlaceholder('Search events…').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="search"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - link "Gatewise Events" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]:
          - img [ref=e8]
          - generic [ref=e12]: Gatewise Events
      - generic [ref=e13]:
        - link "Sign In" [ref=e14] [cursor=pointer]:
          - /url: /login
        - link "Get Started" [ref=e15] [cursor=pointer]:
          - /url: /register
    - main [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: 2 events live now
        - heading "Discover Events Near You" [level=1] [ref=e20]:
          - text: Discover
          - text: Events Near You
        - paragraph [ref=e21]: Find networking events, product demos, private gatherings and more. RSVP in seconds — no account needed.
        - generic [ref=e22]:
          - generic [ref=e23]:
            - img [ref=e24]
            - textbox "Search events…" [ref=e27]
          - combobox [ref=e28]:
            - option "All Categories" [selected]
            - option "Networking"
            - option "Product Demo"
            - option "Private Gathering"
            - option "Industry Event"
            - option "Other"
          - combobox [ref=e29]:
            - option "All Cities" [selected]
            - option "Calgary"
            - option "Edmonton"
            - option "Vancouver"
            - option "Toronto"
            - option "Ottawa"
            - option "Montréal"
            - option "Winnipeg"
            - option "Quebec City"
            - option "Hamilton"
            - option "Kitchener"
            - option "London"
            - option "Victoria"
            - option "Halifax"
            - option "Saskatoon"
            - option "Regina"
          - textbox [ref=e30]
          - combobox [ref=e31]:
            - option "Soonest First" [selected]
            - option "Most Popular"
            - option "Newest Added"
          - button "Search" [ref=e32] [cursor=pointer]
      - generic [ref=e33]:
        - link "Networking" [ref=e34] [cursor=pointer]:
          - /url: /events?category=Networking
        - link "Product Demo" [ref=e35] [cursor=pointer]:
          - /url: /events?category=Product%20Demo
        - link "Private Gathering" [ref=e36] [cursor=pointer]:
          - /url: /events?category=Private%20Gathering
        - link "Industry Event" [ref=e37] [cursor=pointer]:
          - /url: /events?category=Industry%20Event
        - link "Other" [ref=e38] [cursor=pointer]:
          - /url: /events?category=Other
      - generic [ref=e39]:
        - link "Online Events Only" [ref=e40] [cursor=pointer]:
          - /url: /events?online=1
          - img [ref=e41]
          - text: Online Events Only
        - link "This Weekend" [ref=e44] [cursor=pointer]:
          - /url: /events?weekend=1
          - img [ref=e45]
          - text: This Weekend
        - link "Happening Today" [ref=e47] [cursor=pointer]:
          - /url: /events?today=1
          - img [ref=e48]
          - text: Happening Today
        - link "This Week" [ref=e50] [cursor=pointer]:
          - /url: /events?thisweek=1
          - img [ref=e51]
          - text: This Week
      - generic [ref=e54]:
        - link "◈ LIVE Industry Event Green Leaf Cannabis Networking Night Jun 15, 2026 The Emerald Lounge By Jordan Westbrook 2 people going" [ref=e56] [cursor=pointer]:
          - /url: /event/green-leaf-cannabis-networking-night-03q9h
          - generic [ref=e57]:
            - generic [ref=e59]: ◈
            - generic [ref=e61]: LIVE
          - generic [ref=e62]:
            - generic [ref=e63]: Industry Event
            - heading "Green Leaf Cannabis Networking Night" [level=3] [ref=e64]
            - generic [ref=e65]:
              - img [ref=e66]
              - text: Jun 15, 2026
            - generic [ref=e68]:
              - img [ref=e69]
              - text: The Emerald Lounge
            - generic [ref=e72]:
              - generic [ref=e73]: By Jordan Westbrook
              - generic [ref=e75]: 2 people going
        - 'link "Cross Border X Legacy Brands Presents : Mucks Pickleball -Battle of the Budtenders LIVE 19+ Industry Event Cross Border X Legacy Brands Presents : Mucks Pickleball -Battle of the Budtenders Jun 17, 2026 Mucks PickleBall emerald By Devon Paquin Be first to RSVP" [ref=e77] [cursor=pointer]':
          - /url: /event/cross-border-x-legacy-brands-presents-mucks-pickleball-battle-of-the-budtenders-bbqgu
          - generic [ref=e78]:
            - 'img "Cross Border X Legacy Brands Presents : Mucks Pickleball -Battle of the Budtenders" [ref=e79]'
            - generic [ref=e80]:
              - generic [ref=e81]: LIVE
              - generic [ref=e82]: 19+
          - generic [ref=e83]:
            - generic [ref=e84]: Industry Event
            - 'heading "Cross Border X Legacy Brands Presents : Mucks Pickleball -Battle of the Budtenders" [level=3] [ref=e85]'
            - generic [ref=e86]:
              - img [ref=e87]
              - text: Jun 17, 2026
            - generic [ref=e89]:
              - img [ref=e90]
              - text: Mucks PickleBall
            - generic [ref=e94]: emerald
            - generic [ref=e95]:
              - generic [ref=e96]: By Devon Paquin
              - generic [ref=e97]: Be first to RSVP
      - paragraph [ref=e99]:
        - text: Can't find what you're looking for?
        - link "Create your own event →" [ref=e100] [cursor=pointer]:
          - /url: /register
  - navigation "Main navigation" [ref=e102]:
    - link "Home" [ref=e103] [cursor=pointer]:
      - /url: /
      - generic [ref=e104]: ◌
      - generic [ref=e105]: Home
    - link "Browse" [ref=e106] [cursor=pointer]:
      - /url: /events
      - generic [ref=e107]: ◍
      - generic [ref=e108]: Browse
    - link "Start" [ref=e109] [cursor=pointer]:
      - /url: /register
      - generic [ref=e110]: ◎
      - generic [ref=e111]: Start
  - dialog "Cookie consent" [ref=e112]:
    - generic [ref=e113]:
      - generic [ref=e114]:
        - img [ref=e116]
        - paragraph [ref=e120]:
          - text: We use essential cookies to keep you signed in and to improve your experience. By continuing you agree to our
          - link "Privacy Policy" [ref=e121] [cursor=pointer]:
            - /url: /privacy
          - text: .
      - generic [ref=e122]:
        - button "Decline" [ref=e123] [cursor=pointer]
        - button "Accept" [ref=e124] [cursor=pointer]
  - generic "Notifications"
  - button "Open Next.js Dev Tools" [ref=e130] [cursor=pointer]:
    - img [ref=e131]
  - alert [ref=e134]
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
> 11  |     await expect(page.locator('input[name="search"]')).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
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
  56  |       await expect(page.locator('h1')).toBeVisible();
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
```