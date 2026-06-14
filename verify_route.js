const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[Error] ${err.message}`));
  
  await page.goto('http://localhost:8100/home', { waitUntil: 'networkidle2' });
  
  const initialUrl = page.url();
  console.log('Initial URL:', initialUrl);
  
  // Get DOM attributes of the Activity tab
  const tabHTML = await page.$eval('app-bottom-nav .nav-item:nth-child(2)', el => el.outerHTML);
  console.log('\n--- DOM HTML of Activity Tab ---');
  console.log(tabHTML);
  console.log('--------------------------------\n');
  
  // Puppeteer physical click
  console.log('Attempting Puppeteer simulated physical click...');
  try {
    await page.click('app-bottom-nav .nav-item:nth-child(2)');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Physical click failed:', e.message);
  }
  
  console.log('URL after physical click:', page.url());
  
  // JS explicit .click()
  if (page.url() === initialUrl) {
    console.log('\nAttempting JavaScript explicit .click()...');
    await page.$eval('app-bottom-nav .nav-item:nth-child(2)', el => el.click());
    await page.waitForTimeout(1000);
    console.log('URL after JS click:', page.url());
  }

  // Direct navigation
  console.log('\nAttempting direct navigation to /activity...');
  await page.goto('http://localhost:8100/activity', { waitUntil: 'networkidle2' });
  console.log('Direct navigation URL:', page.url());
  
  console.log('\n--- Console Logs ---');
  logs.forEach(l => console.log(l));
  
  await browser.close();
})();
