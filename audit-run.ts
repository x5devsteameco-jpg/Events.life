import { chromium } from '@playwright/test';

async function audit() {
  const results: string[] = [];
  const note = (s: string) => { results.push(s); process.stdout.write(s + '\n'); };

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const BASE = 'http://localhost:3001';

  // 1. Homepage
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const heroText = await page.locator('h1').first().textContent().catch(() => 'N/A');
  note(`[HOME] H1: "${heroText?.trim()}"`);
  const hasHeroBtn = await page.locator('a[href*="register"], a[href*="events"]').count();
  note(`[HOME] Hero CTAs: ${hasHeroBtn}`);
  const featureCards = await page.locator('[class*="feature"], [class*="card"]').count();
  note(`[HOME] Feature/card sections: ${featureCards}`);
  await page.screenshot({ path: '/tmp/h1.png', fullPage: false });

  // 2. Events browse
  await page.goto(`${BASE}/events`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const searchInput = await page.locator('input[type="search"], input[placeholder*="earch"]').count();
  note(`[EVENTS] Search input: ${searchInput > 0}`);
  const filterBtns = await page.locator('button').count();
  note(`[EVENTS] Buttons (includes filters): ${filterBtns}`);
  const eventLinks = await page.locator('a[href*="/event/"]').count();
  note(`[EVENTS] Event card links: ${eventLinks}`);
  await page.screenshot({ path: '/tmp/h2.png', fullPage: false });

  // 3. Event detail
  const firstEventHref = await page.locator('a[href*="/event/"]').first().getAttribute('href').catch(() => null);
  if (firstEventHref) {
    await page.goto(`${BASE}${firstEventHref}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    note(`[EVENT DETAIL] URL: ${page.url()}`);
    const rsvpBtn = await page.locator('button, a').filter({ hasText: /RSVP|register|attend/i }).count();
    note(`[EVENT DETAIL] RSVP/register button: ${rsvpBtn}`);
    const hasFAQ = await page.locator('[class*="faq"], [class*="accordion"]').count();
    note(`[EVENT DETAIL] FAQ/accordion: ${hasFAQ}`);
    const hasVenue = await page.locator('[class*="venue"], [class*="location"]').count();
    note(`[EVENT DETAIL] Venue section: ${hasVenue}`);
    await page.screenshot({ path: '/tmp/h3.png', fullPage: false });
  }

  // 4. Login
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  note(`[LOGIN] Page loaded`);
  const hasEmail = await page.locator('input[type="email"]').count();
  const hasPass = await page.locator('input[type="password"]').count();
  note(`[LOGIN] email=${hasEmail > 0}, password=${hasPass > 0}`);
  await page.screenshot({ path: '/tmp/h4.png', fullPage: false });

  // 5. Auth flow
  await page.fill('input[type="email"]', 'testadmin@gatewise.ca');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    note(`[AUTH] Login successful → ${page.url()}`);
  } catch {
    note(`[AUTH] Login failed or slow — current URL: ${page.url()}`);
  }
  await page.screenshot({ path: '/tmp/h5.png', fullPage: false });

  // 6. Dashboard
  const statCount = await page.locator('[class*="stat"], h2, [class*="metric"]').count();
  note(`[DASHBOARD] Stat headings/cards: ${statCount}`);
  const sidebarLinks = await page.locator('nav a, aside a').count();
  note(`[DASHBOARD] Sidebar/nav links: ${sidebarLinks}`);
  await page.screenshot({ path: '/tmp/h6.png', fullPage: false });

  // 7. My Events
  await page.goto(`${BASE}/dashboard/events`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const myEvents = await page.locator('a[href*="/event/"], article, [class*="event"]').count();
  note(`[MY EVENTS] Event items: ${myEvents}`);
  const newEventBtn = await page.locator('a[href*="new"]').count();
  note(`[MY EVENTS] New event button: ${newEventBtn > 0}`);
  await page.screenshot({ path: '/tmp/h7.png', fullPage: false });

  // 8. Event wizard
  await page.goto(`${BASE}/dashboard/events/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const stepDots = await page.locator('[class*="step"], [class*="wizard"]').count();
  note(`[WIZARD] Step indicators: ${stepDots}`);
  const inputCount = await page.locator('input, textarea, select').count();
  note(`[WIZARD] Form fields step1: ${inputCount}`);
  const hasDateField = await page.locator('input[type="datetime-local"]').count();
  note(`[WIZARD] Date/time field: ${hasDateField > 0}`);
  await page.screenshot({ path: '/tmp/h8.png', fullPage: false });

  // 9. Settings
  await page.goto(`${BASE}/dashboard/settings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const themeButtons = await page.locator('button[type="button"]').count();
  note(`[SETTINGS] Buttons (includes theme picker): ${themeButtons}`);
  const hasThemeSection = await page.locator('label').filter({ hasText: /accent|theme|colour/i }).count();
  note(`[SETTINGS] Theme/colour label: ${hasThemeSection}`);
  await page.screenshot({ path: '/tmp/h9.png', fullPage: false });

  // 10. Saved events
  await page.goto(`${BASE}/dashboard/saved`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  note(`[SAVED] Page loaded: ${page.url()}`);
  await page.screenshot({ path: '/tmp/h10.png', fullPage: false });

  // 11. Admin
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const adminHeading = await page.locator('h1, h2').first().textContent().catch(() => 'N/A');
  note(`[ADMIN] Heading: "${adminHeading?.trim()}"`);
  const adminLinks = await page.locator('a').count();
  note(`[ADMIN] Total links: ${adminLinks}`);
  await page.screenshot({ path: '/tmp/h11.png', fullPage: false });

  // 12. Admin users
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const userRows = await page.locator('tr').count();
  note(`[ADMIN USERS] Table rows: ${userRows}`);
  await page.screenshot({ path: '/tmp/h12.png', fullPage: false });

  // 13. Admin reports
  await page.goto(`${BASE}/admin/reports`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const reportSections = await page.locator('h2, h3, [class*="chart"]').count();
  note(`[ADMIN REPORTS] Report sections/charts: ${reportSections}`);
  await page.screenshot({ path: '/tmp/h13.png', fullPage: false });

  await ctx.close();

  // 14. Mobile viewport
  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' });
  const m = await mCtx.newPage();
  await m.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const hamburger = await m.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [class*="hamburger"]').count();
  note(`[MOBILE HOME] Hamburger/menu: ${hamburger}`);
  await m.screenshot({ path: '/tmp/m1.png', fullPage: false });

  await m.goto(`${BASE}/login`);
  await m.fill('input[type="email"]', 'testadmin@gatewise.ca');
  await m.fill('input[type="password"]', 'Admin123!');
  await m.click('button[type="submit"]');
  await m.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
  const bottomNav = await m.locator('[class*="mobile-nav"], [class*="bottom"], nav').count();
  note(`[MOBILE DASHBOARD] Bottom nav elements: ${bottomNav}`);
  await m.screenshot({ path: '/tmp/m2.png', fullPage: false });

  await m.goto(`${BASE}/dashboard/events/new`);
  await m.screenshot({ path: '/tmp/m3.png', fullPage: false });
  note(`[MOBILE WIZARD] Loaded: ${m.url()}`);

  await mCtx.close();
  await browser.close();

  console.log('\n======= FINAL AUDIT LOG =======');
  results.forEach(r => console.log(r));
  console.log('================================');
}

audit().catch(e => { console.error('AUDIT FAILED:', e.message); process.exit(1); });
