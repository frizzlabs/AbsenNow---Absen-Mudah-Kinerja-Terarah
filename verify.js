const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8100', { waitUntil: 'networkidle0' });
    
    const result1 = await page.evaluate(() => typeof window.resetAppState === "function");
    const result2 = await page.evaluate(() => typeof window.resetAppState);
    
    console.log(`Evaluation 1: typeof window.resetAppState === "function" -> ${result1}`);
    console.log(`Evaluation 2: typeof window.resetAppState -> "${result2}"`);
    
    await browser.close();
  } catch (error) {
    console.error("Puppeteer Error:", error);
  }
})();
