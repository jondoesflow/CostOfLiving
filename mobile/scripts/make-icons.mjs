// Renders the app icon, Android adaptive layers, splash image and favicon from one SVG mark
// (the website's money bag + purple bulb), using the pre-installed Chromium.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const bag = `
  <path d="M256 60c-90 0-150 70-150 150 0 60 30 95 60 130 20 25 30 50 30 80h120c0-30 10-55 30-80 30-35 60-70 60-130 0-80-60-150-150-150Z" fill="#8b5cf6"/>
  <path d="M216 420v-95c0-22 22-30 40-15 18-15 40-7 40 15v95" stroke="#ede9fe" stroke-width="18" fill="none" stroke-linecap="round"/>
  <rect x="176" y="428" width="160" height="40" rx="14" fill="#94a3b8"/>
  <text x="256" y="262" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="170" fill="#ffffff">£</text>`;
const svg = (w, bg, scale = 1, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 512 512">
  ${bg ? `<rect width="512" height="512" fill="${bg}"/>` : ''}
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${bag}</g>${extra}</svg>`;
const mono = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><g transform="translate(256 256) scale(0.62) translate(-256 -256)">
  <path d="M256 60c-90 0-150 70-150 150 0 60 30 95 60 130 20 25 30 50 30 80h120c0-30 10-55 30-80 30-35 60-70 60-130 0-80-60-150-150-150Z" fill="#fff"/>
  <rect x="176" y="428" width="160" height="40" rx="14" fill="#fff"/></g></svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();
const shot = async (markup, size, path, omitBackground = false) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${omitBackground ? 'transparent' : 'white'}">${markup}</body></html>`);
  const buf = await page.screenshot({ omitBackground, clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(path, buf);
};
mkdirSync('assets', { recursive: true });
await shot(svg(1024, '#1D3461', 0.78), 1024, 'assets/icon.png');                     // opaque, square: iOS rounds it
await shot(svg(1024, null, 0.56), 1024, 'assets/android-icon-foreground.png', true);  // safe zone is the middle 66%
await shot(svg(1024, '#1D3461', 0), 1024, 'assets/android-icon-background.png');
await shot(mono.replace('width="512" height="512"', 'width="1024" height="1024"'), 1024, 'assets/android-icon-monochrome.png', true);
await shot(svg(512, null, 0.9), 512, 'assets/splash-icon.png', true);
await shot(svg(96, null, 1), 96, 'assets/favicon.png', true);
await browser.close();
console.log('icons written');
