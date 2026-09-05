import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('first screen names the job, audience, and sample action', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Generative Palette A11y — check sketch palettes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check generative palettes in real sketch frames');
  await expect(page.getByText('For generative-coding artists who need colors more viewers can tell apart in moving sketches.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});

test('input text remains text and cannot create an executable element', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  await page.locator('#name-2').fill('<img src=x onerror=window.xssMarker=1>');
  await expect(page.locator('#name-2')).toHaveValue('<img src=x onerror=window.xssMarker=1>');
  await expect(page.locator('#report')).toContainText('<img src=x onerror=window.xssMarker=1>');
  expect(await page.evaluate(() => (window as Window & { xssMarker?: number }).xssMarker)).toBeUndefined();
  await expect(page.locator('#report img')).toHaveCount(0);
});

test('invalid hex and no-selected-simulation states recover', async ({ page }) => {
  await page.goto('/demo');
  const hex = page.locator('#hex-1');
  await hex.fill('#QQQQQQ');
  await expect(hex).toHaveAttribute('aria-invalid', 'true');
  await hex.fill('#24364A');
  await expect(hex).not.toHaveAttribute('aria-invalid', 'true');
  for (const checkbox of await page.locator('input[name="simulation"]').all()) await checkbox.uncheck();
  await expect(page.locator('#report')).toContainText('Choose a viewing condition.');
  await page.locator('input[name="simulation"][value="normal"]').check();
  await expect(page.locator('.analysis-summary')).toBeVisible();
});

test('all visible action targets meet the 44px baseline', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  const tooSmall = await page.locator('button, a[href], input[type="color"], .name-input, .hex-input, .file-button, .simulations label').evaluateAll(nodes =>
    nodes.filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && (rect.width < 44 || rect.height < 44);
    }).map(node => ({ text: node.textContent, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }))
  );
  expect(tooSmall).toEqual([]);
});

test('200 percent zoom reflow has no horizontal overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 195, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/demo');
    await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  } finally {
    await context.close();
  }
});

test('page has no axe violations at desktop or mobile', async ({ page, browser }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const mobile = await context.newPage();
    await mobile.goto('/demo');
    await expect(mobile.getByText('Sample: Night transit loop')).toBeVisible();
    expect((await new AxeBuilder({ page: mobile }).analyze()).violations).toEqual([]);
  } finally {
    await context.close();
  }
});

test('legal routes and 404 page provide named pages and landmarks', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  }
});
