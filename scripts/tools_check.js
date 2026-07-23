const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  await page.goto('http://localhost:3201/tools/penalty-calculator', { waitUntil: 'networkidle' });
  await page.fill('#tax', '2500000');
  await page.fill('#days', '15');
  await page.waitForTimeout(150);
  const m1 = await page.evaluate(() => ({ docWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  console.log('penalty-calculator scroll check:', JSON.stringify(m1));
  await page.screenshot({ path: 'scripts/penalty_mobile.png', fullPage: true });

  await page.goto('http://localhost:3201/tools/irn-validator', { waitUntil: 'networkidle' });
  await page.fill('#irn', '1767081600000482913657');
  await page.waitForTimeout(150);
  const m2 = await page.evaluate(() => ({ docWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  console.log('irn-validator scroll check:', JSON.stringify(m2));
  await page.screenshot({ path: 'scripts/irn_mobile.png', fullPage: true });

  await browser.close();
})();
