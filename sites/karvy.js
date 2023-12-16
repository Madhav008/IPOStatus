import { createWorker } from 'tesseract.js';
import puppeteer from 'puppeteer'
import Jimp from 'jimp';

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

async function enhanceImage(imagePath, scaleFactor = 4) {
    try {
        // Read the image using Jimp
        const image = await Jimp.read(imagePath);

        // Example: Apply a greyscale filter to enhance the image
        image.greyscale();

        // Resize the image (enlarge) by a specified scaleFactor
        image.scale(scaleFactor);

        // Sharpen the image using a convolution matrix
        const sharpenKernel = [
            [-1, -1, -1],
            [-1, 9, -1],
            [-1, -1, -1]
        ];
        image.convolute(sharpenKernel);

        // Save the enhanced and resized image
        await image.writeAsync('screenshot.png');

        return 'screenshot.png';
    } catch (error) {
        console.error('Error enhancing image:', error);
        return null;
    }

}


const processPan = async (page, PAN, company_id, maxRetries = 3) => {
    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
        await sleep(1000)

        const divSelector = 'img#captchaimg';

        await page.waitForSelector(divSelector);


        const divBoundingBox = await page.$eval(divSelector, div => {
            const { x, y, width, height } = div.getBoundingClientRect();
            return { x, y, width, height };
        });

        // Check if the width is positive
        if (divBoundingBox.width <= 0) {
            console.error(`Error processing PAN ${PAN}: Width of the bounding box is not positive`);
            divBoundingBox.width = divBoundingBox.width + 20
        }

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
        const captchaCode = await decodeCaptcha()

        console.log('Screenshot captured successfully!');


        if (captchaCode) {

            await page.select('#ddl_ipo', company_id);
            await page.click('#pan');
            await page.type('#txt_pan', PAN);


            await page.type('#txt_captcha', captchaCode + '');


            await page.click('#btn_submit_query');

            try {
                await page.waitForSelector('#hdr_ipo', { timeout: 2000 });

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

                await page.click('#lnk_new');

                return data
            } catch (error) {

                console.log('Confirmation box appeared or timeout occurred. Handling this scenario...');

                const confirmationText = await page.evaluate(() => {
                    const confirmationBox = document.querySelector('.jconfirm-content');
                    return confirmationBox ? confirmationBox.textContent.trim() : null;
                });

                console.log('Confirmation text:', confirmationText);

                if (confirmationText.includes('CAPTCHA is invalid or Expired')) {
                    console.log(`Retrying PAN ${PAN} due to CAPTCHA error. Retry count: ${retryCount + 1}`);
                    // Optionally, you can add a delay before retrying to avoid being blocked
                    await page.click('.jconfirm-buttons')
                    await page.waitForTimeout(1000);
                } else {
                    await page.click('.jconfirm-buttons');
                    return ({ PAN: PAN, QTY: confirmationText })
                }
            }


        }
    }
}
const karvyCaptcha = async (PAN, company_id) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new",
    });

    const page = await browser.newPage();
    // page.setDefaultTimeout(2000);
    await page.setViewport({ width: 1000, height: 800 });

    await page.goto('https://kosmic.kfintech.com/ipostatus/');

    const processPandata = [];

    for (const Pan of PAN) {
        const data = await processPan(page, Pan, company_id)
        processPandata.push(data)
    }
    await browser.close()

    console.log(processPandata)

    return processPandata;
}



async function decodeCaptcha() {

    // Enhance the image before passing it to Tesseract
    var enhancedImagePath = await enhanceImage('screenshot.png', 16);
    // var enhancedImagePath = await enhanceImage('screenshot.png', 16);

    enhancedImagePath = await enhanceImage(enhancedImagePath, 1 / 16);


    const worker = await createWorker();

    const ret = await worker.recognize('screenshot.png', 'eng');

    console.log(ret.data.text)
    // Extract digits from the recognized text
    const numbersOnly = ret.data.text.match(/\d+/g);

    // Check if numbersOnly is not null or undefined before applying join
    const captchaCode = numbersOnly ? numbersOnly.join('') : '';

    await worker.terminate();

    return captchaCode
}



export { getKarvyIpoList, karvyCaptcha }

