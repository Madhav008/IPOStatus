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

const karvyCaptcha = async (PAN, company_id) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new",
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(2000);


    await page.goto('https://rti.kfintech.com/ipostatus/');
    const divSelector = 'img#captchaimg';
    await page.waitForSelector(divSelector);



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

        // Extract digits from the recognized text
        const numbersOnly = ret.data.text.match(/\d+/g);

        // Check if numbersOnly is not null or undefined before applying join
        const captchaCode = numbersOnly ? numbersOnly.join('') : '';
        await worker.terminate();

        console.log(captchaCode);
        console.log('Screenshot captured successfully!');


        if (captchaCode) {

            await page.select('#ddl_ipo', company_id);
            await page.click('#pan');
            await page.type('#txt_pan', PAN);


            await page.type('#txt_captcha', captchaCode + '');


            await page.click('#btn_submit_query');


            await page.waitForSelector('#hdr_ipo');

            const data = await page.evaluate(() => {
                const rowData = {};

                // Select the container with class "successbox_md"
                const container = document.querySelector('.successbox_md');

                // Check if the container is found
                if (container) {
                    // Select elements within the container using querySelector or querySelectorAll
                    const applicationNumber = container.querySelector('#grid_results_ctl02_l1');
                    const category = container.querySelector('#grid_results_ctl02_Label1');
                    const name = container.querySelector('#grid_results_ctl02_Label2');
                    const clientId = container.querySelector('#grid_results_ctl02_lbl_dpclid');
                    const pan = container.querySelector('#grid_results_ctl02_lbl_pan');
                    const applied = container.querySelector('#grid_results_ctl02_Label5');
                    const allotted = container.querySelector('#grid_results_ctl02_lbl_allot');

                    // Check if elements are found
                    if (applicationNumber && category && name && clientId && pan && applied && allotted) {
                        rowData['Application Number'] = applicationNumber.textContent.trim();
                        rowData['Category'] = category.textContent.trim();
                        rowData['Name'] = name.textContent.trim();
                        rowData['Client ID'] = clientId.textContent.trim();
                        rowData['PAN'] = pan.textContent.trim();
                        rowData['Applied'] = parseInt(applied.textContent.trim());
                        rowData['Alloted'] = parseInt(allotted.textContent.trim());
                    }
                }
                return rowData;
            });
            return data
        }
    } catch (error) {
        throw new Error(PAN);
    } finally {
        await browser.close();
    }
}

export { getKarvyIpoList, karvyCaptcha }

