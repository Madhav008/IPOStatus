import { createWorker } from 'tesseract.js';
import puppeteer from 'puppeteer'

const getKarvyIpoList = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new"
    });
    const page = await browser.newPage();

    try {
        await page.goto('https://rti.kfintech.com/ipostatus/');
        await page.waitForSelector('#ddl_ipo');

        const options = await page.evaluate(() => {
            const selectElement = document.querySelector('#ddl_ipo');
            const optionElements = selectElement.querySelectorAll('option'); // Select only uncommented options
            const optionValues = Array.from(optionElements).map(option => option.textContent.trim() + "--" + option.value);
            return optionValues;
        });
        return options;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }

}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const karvyCaptcha = async () => {
    const browser = await puppeteer.launch({
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false
    });
    const page = await browser.newPage();


    try {
        await page.goto('https://rti.kfintech.com/ipostatus/');
        const divSelector = 'img#captchaimg';
        await page.waitForSelector(divSelector);
        const ipoStatusList = [];
        const failedPans = [];
        var company_id = "CHFE~cholainvest_ncds3~0~07/12/2023~07/12/2023~BON"
        const retryKarvy = async (PAN) => {
            try {
                // Navigate to the webpage

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

                // Create the worker outside the inner function
                const worker = await createWorker('eng');

                const ret = await worker.recognize('screenshot.png');
                console.log(ret.data.text);

                // Extract digits from the recognized text
                const numbersOnly = ret.data.text.match(/\d+/g);

                // Check if numbersOnly is not null or undefined before applying join
                const captchaCode = numbersOnly ? numbersOnly.join('') : '';
                await worker.terminate();


                console.log('Screenshot captured successfully!');

                if (captchaCode) {
                    await page.select('#ddl_ipo', company_id);
                    await page.click('#pan');
                    sleep(1000)
                    await page.type('#txt_pan', PAN);


                    await page.type('#txt_captcha', captchaCode + '');
                    await page.click('#btn_submit_query');
                }



            } catch (error) {
                console.error(`Failed to retrieve data for PAN ${PAN} even after retry.`);
                return null;
            }
        }

        retryKarvy("1q2312423")

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }





    // Close the browser
    // await browser.close();

}
export { getKarvyIpoList }