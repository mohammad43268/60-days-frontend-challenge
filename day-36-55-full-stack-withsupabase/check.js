import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });
  page.on('pageerror', error => {
    console.log(`PAGE ERROR:`, error.message);
  });
  
  try {
    await page.goto('http://localhost:5173');
    await new Promise(r => setTimeout(r, 2000));
  } catch(e) {
    console.error(e);
  }
  await browser.close();
})();
