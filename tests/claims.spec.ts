import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLxZAAAAABJRU5ErkJggg==', 'base64');

test('@claim:demo-sandbox changes stay in the demo sandbox', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto('/demo');
    await expect(page.getByLabel('Sample data mode')).toBeVisible();
    await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
    await expect(page.locator('.frame')).toHaveCount(2);
    await page.locator('#name-1').fill('Changed only in the demo');
    await expect(page.locator('#name-1')).toHaveValue('Changed only in the demo');
    await page.getByRole('button', { name: 'Start for real' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#name-1')).toHaveValue('Night ink');
    await expect(page.getByLabel('Sample data mode')).toBeHidden();
    await expect.poll(() => page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:sample-analysis shows populated sample output', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  await expect(page.locator('.frame')).toHaveCount(2);
  await expect(page.locator('.analysis-summary')).toContainText('Weighted across 2 frames.');
  await expect(page.locator('.findings')).toBeVisible();
  expect(await page.locator('.finding').count()).toBeGreaterThan(0);
});

test('@claim:offline-reload reloads the controlled demo without a network connection', async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto('/demo');
    await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
    await expect(page.locator('.analysis-summary')).toContainText('Weighted across 2 frames.');
  } finally {
    await context.close();
  }
});

test('@claim:local-processing sends only first-party requests and needs no sign-in', async ({ page, baseURL }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  await page.getByRole('button', { name: 'Add swatch' }).click();
  await expect(page.locator('.swatch-row')).toHaveCount(6);
  await expect(page.getByRole('textbox', { name: 'Swatch name' }).first()).toBeVisible();
  const origin = new URL(baseURL!).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:json-export downloads a usable field-notes JSON file', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Sample: Night transit loop')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export field notes' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('palette-a11y-field-notes.json');
  const path = await download.path();
  expect(path).not.toBeNull();
  const data = JSON.parse(readFileSync(path!, 'utf8'));
  expect(data.swatches).toHaveLength(5);
  expect(data.frames).toHaveLength(2);
  expect(data.selectedSimulations).toContain('deuteranopia');
});

test('@claim:frame-limit accepts six frames and explains the extra-frame recovery', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.frame')).toHaveCount(2);
  await page.locator('#frames').setInputFiles({
    name: 'too-large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(8_000_001)
  });
  await expect(page.locator('#frameError')).toContainText('over 8 MB');
  const fourFrames = Array.from({ length: 4 }, (_, index) => ({
    name: `sample-${index}.png`,
    mimeType: 'image/png',
    buffer: tinyPng
  }));
  await page.locator('#frames').setInputFiles(fourFrames);
  await expect(page.locator('.frame')).toHaveCount(6);
  await page.locator('#frames').setInputFiles({ name: 'extra.png', mimeType: 'image/png', buffer: tinyPng });
  await expect(page.locator('#frameError')).toContainText('Remove one before adding another');
});
