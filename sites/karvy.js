import puppeteer from 'puppeteer'
const karvyCaptcha = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new"
    });
    const page = await browser.newPage();

    // Navigate to the webpage
    await page.goto('https://rti.kfintech.com/ipostatus/');

    // Use a specific CSS selector to identify the div
    const divSelector = 'img#captchaimg';
    // const divSelector = 'div.captcha'
    // Wait for the div to be rendered
    await page.waitForSelector(divSelector);

    // Get the bounding box of the div
    const divBoundingBox = await page.$eval(divSelector, div => {
        const { x, y, width, height } = div.getBoundingClientRect();
        return { x, y, width, height };
    });

    // Capture screenshot of the div
    await page.screenshot({
        path: 'screenshot.png',
        clip: {
            x: divBoundingBox.x,
            y: divBoundingBox.y,
            width: divBoundingBox.width,
            height: divBoundingBox.height,
        },
    });

    console.log('Screenshot captured successfully!');

    // Close the browser
    // await browser.close();

}

export default karvyCaptcha