const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const filePath = `file://${path.resolve(__dirname, 'benchmark.html')}`;
    await page.goto(filePath);

    // Wait for the results to appear
    await page.waitForSelector('#results');
    const results = await page.$eval('#results', el => el.innerText);
    console.log(results);

    await browser.close();
})();
