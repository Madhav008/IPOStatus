import puppeteer from 'puppeteer'
const bigshare = async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');

  // Execute JavaScript on the page to access session storage
  const sessionData = await page.evaluate(() => {
    return sessionStorage.getItem('captchaCode');
  });

  console.log('Session Storage Data:', sessionData);

  // Close the browser
  await browser.close();
}


export default bigshare