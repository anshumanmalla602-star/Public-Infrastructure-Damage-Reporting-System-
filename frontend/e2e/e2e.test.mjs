import { chromium } from 'playwright';
import fs from 'fs';

// Chrome/Chromium executable to drive. Override with CHROME_PATH, otherwise we
// probe the usual install locations so the suite is not tied to one machine.
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const resolveChrome = () => CHROME_CANDIDATES.find((c) => fs.existsSync(c)) || null;

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

const results = [];
const check = (name, cond, extra = '') => {
  results.push({ name, pass: !!cond, extra });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : ' ' + extra}`);
};

const errors = [];

(async () => {
  const executablePath = resolveChrome();
  if (!executablePath) {
    console.error(
      'Could not find a Chrome/Chromium executable.\n' +
      `Looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}\n` +
      'Set CHROME_PATH to the browser executable and re-run.'
    );
    process.exit(1);
  }
  console.log(`Using browser: ${executablePath}`);
  console.log(`Target app:    ${BASE}`);

  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  console.log('\n=== PUBLIC PAGES ===');

  await page.goto(BASE, { waitUntil: 'networkidle' });
  check('home page renders hero', await page.getByRole('heading', { name: /Report damaged roads/i }).isVisible());
  check('navbar shows brand', await page.getByText('CivicFix').first().isVisible());

  await page.goto(`${BASE}/marketplace`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const serviceCount = await page.locator('a[href^="/services/"]').count();
  check('marketplace lists services from API', serviceCount > 0, `count=${serviceCount}`);

  await page.goto(`${BASE}/guidance`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const guideCount = await page.locator('text=Licensing').first().count();
  check('guidance page loads articles', guideCount > 0);

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  check('login page renders', await page.getByRole('heading', { name: /Sign in to CivicFix/i }).isVisible());

  console.log('\n=== CITIZEN FLOW ===');

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel(/Email address/i).fill('citizen@example.com');
  await page.getByLabel(/^Password$/i).fill('Admin@123');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL('**/my-issues', { timeout: 15000 });
  check('citizen login redirects to my issues', page.url().includes('/my-issues'));
  check('navbar shows user name', await page.getByText('Ravi Kumar').first().isVisible());

  await page.goto(`${BASE}/report`, { waitUntil: 'networkidle' });
  check('report form renders', await page.getByLabel(/What is damaged/i).isVisible());
  await page.getByLabel(/What is damaged/i).selectOption('Pothole');
  await page.getByLabel(/Describe the issue/i).fill('Browser E2E test - deep pothole near the school gate.');
  await page.getByLabel(/Location description/i).fill('Test Street, Chennai');
  await page.getByRole('button', { name: /Submit report/i }).click();
  await page.waitForURL('**/my-issues', { timeout: 15000 });
  await page.waitForTimeout(1500);
  const issueVisible = await page.getByText(/Browser E2E test/i).first().count();
  check('submitted issue appears in my issues', issueVisible > 0);

  console.log('\n=== MARKETPLACE INQUIRY ===');

  await page.goto(`${BASE}/marketplace`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('a[href^="/services/"]').first().click();
  await page.waitForTimeout(1200);
  check('service detail page loads', await page.getByRole('button', { name: /Send inquiry/i }).isVisible());
  await page.getByRole('button', { name: /Send inquiry/i }).click();
  await page.waitForTimeout(600);
  await page.getByLabel(/Your message/i).fill('Do you deliver to my area? Please share availability.');
  await page.getByRole('dialog').getByRole('button', { name: /Send inquiry/i }).click();
  await page.waitForTimeout(1500);
  const sent = await page.getByText(/Inquiry sent/i).count();
  check('inquiry submission succeeds', sent > 0);

  console.log('\n=== ENTREPRENEUR FLOW ===');
  await page.goto(`${BASE}/logout-check`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel(/Email address/i).fill('entrepreneur@example.com');
  await page.getByLabel(/^Password$/i).fill('Admin@123');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL('**/entrepreneur', { timeout: 15000 });
  check('entrepreneur login redirects to dashboard', page.url().includes('/entrepreneur'));
  await page.waitForTimeout(2500);
  check('business name visible', await page.getByText('Priya Home Tiffin').first().isVisible());
  const svcCount = await page.locator('text=My services').count();
  check('entrepreneur services section renders', svcCount > 0);

  console.log('\n=== ADMIN FLOW ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel(/Email address/i).fill('admin@platform.com');
  await page.getByLabel(/^Password$/i).fill('Admin@123');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL('**/admin', { timeout: 15000 });
  check('admin login redirects to dashboard', page.url().includes('/admin'));
  await page.waitForTimeout(2500);
  check('dashboard shows stat cards', await page.getByText('Total users').isVisible());
  check('dashboard shows issue breakdown', await page.getByText('Issues by status').isVisible());

  await page.goto(`${BASE}/admin/profiles`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  check('admin profiles page renders', await page.getByRole('heading', { name: /Business approvals/i }).isVisible());

  await page.goto(`${BASE}/admin/content`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  check('admin content page renders', await page.getByRole('heading', { name: /Guidance content/i }).isVisible());

  await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const userRows = await page.locator('tbody tr').count();
  check('admin users table lists users', userRows > 0, `rows=${userRows}`);

  console.log('\n=== AUTHORITY FLOW ===');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel(/Email address/i).fill('authority@city.gov.in');
  await page.getByLabel(/^Password$/i).fill('Admin@123');
  await page.getByRole('button', { name: /^Sign in$/i }).click();
  await page.waitForURL('**/authority/issues', { timeout: 15000 });
  check('authority login redirects to issues', page.url().includes('/authority/issues'));
  await page.waitForTimeout(2500);
  const updateBtns = await page.getByRole('button', { name: /Update/i }).count();
  check('authority sees issue update controls', updateBtns > 0, `count=${updateBtns}`);

  await page.getByRole('button', { name: /Update/i }).first().click();
  await page.waitForTimeout(800);
  check('status modal opens', await page.getByRole('heading', { name: /Update issue status/i }).isVisible());
  await page.getByRole('dialog').getByLabel('Status', { exact: true }).selectOption('in_progress');
  await page.getByRole('button', { name: /Save update/i }).click();
  await page.waitForTimeout(1500);
  const successToast = await page.getByText(/Issue marked as in progress/i).count();
  check('issue status update succeeds', successToast > 0);

  console.log('\n=== RESPONSIVE / MOBILE ===');
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mobile.newPage();
  await mp.goto(BASE, { waitUntil: 'networkidle' });
  const burger = await mp.getByRole('button', { name: /Toggle navigation menu/i }).isVisible();
  check('mobile hamburger menu visible', burger);
  await mp.getByRole('button', { name: /Toggle navigation menu/i }).click();
  await mp.waitForTimeout(500);
  const mobileMenu = await mp.getByRole('link', { name: /Marketplace/i }).first().isVisible();
  check('mobile menu opens', mobileMenu);
  await mobile.close();

  console.log('\n=== CONSOLE ERRORS ===');
  const realErrors = errors.filter((e) => !e.includes('favicon') && !e.includes('404'));
  check('no console/page errors', realErrors.length === 0, realErrors.slice(0, 5).join(' | '));

  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\n=== E2E RESULTS: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((err) => {
  console.error('E2E CRASH:', err);
  process.exit(1);
});
