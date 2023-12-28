import { createWorker } from 'tesseract.js';
import { promises as fsPromises } from 'fs';
import Jimp from 'jimp';
import axios from 'axios'
import cheerio from 'cheerio'
import { exec, execSync } from 'child_process';
import { logger } from '../logger.js';
import { cacheData, checkIfCached } from '../controllers/cacheController.js';
import puppeteer from 'puppeteer';
const getKarvyIpoList = async () => {
    try {
        const response = await axios.get('https://kosmic.kfintech.com/ipostatus/');
        const html = response.data;

        const $ = cheerio.load(html);
        const options = $('#ddl_ipo option')
            .filter((index, element) => $(element).attr('value') !== undefined) // Check if the "value" attribute exists
            .map((index, element) => `${$(element).text().trim()}--${$(element).val()}`)
            .get();

        return options;
    } catch (error) {
        console.error('Error:', error);
        logger.error({ message: 'Error in getKarvyIpoList:' + error });

    }
}
async function decodeCaptcha(img) {

    try {
        // Enhance the image before passing it to Tesseract
        var enhancedImagePath = await enhanceImage(img, 16);
        // var enhancedImagePath = await enhanceImage('screenshot.png', 16);

        enhancedImagePath = await enhanceImage(enhancedImagePath, 1 / 16);


        const worker = await createWorker();

        const ret = await worker.recognize(enhancedImagePath, 'eng');

        // Extract digits from the recognized text
        const numbersOnly = ret.data.text.match(/\d+/g);

        // Check if numbersOnly is not null or undefined before applying join
        const captchaCode = numbersOnly ? numbersOnly.join('') : '';

        await worker.terminate();

        return captchaCode
    } catch (error) {
        console.log("ERROR WHILE DECODING CAPTCHA")
        logger.error({ message: 'ERROR WHILE DECODING CAPTCHA:' + error });

        return 0
    }
}

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
        await image.writeAsync(imagePath);

        return imagePath;
    } catch (error) {
        console.error('Error enhancing image:', error);
        logger.error({ message: 'Error enhancing image:' + error });

        return imagePath;
    }

}

function decodeMessaage(html) {

    const $ = cheerio.load(html);

    // Select the script tag and get its text content
    const scriptContent = $('script').text();

    // Extract the ShowMessage function and its arguments using a regular expression
    const regexResult = /ShowMessage\('([^']+)',\s*'([^']+)'\)/.exec(scriptContent);

    if (regexResult && regexResult[1] && regexResult[2]) {
        const functionName = 'ShowMessage';
        const argument1 = regexResult[1];
        const argument2 = regexResult[2];

        // console.log(`${functionName}('${argument1}', '${argument2}')`);
        return `${functionName}('${argument1}', '${argument2}')`
    } else {
        return 'ShowMessage function not found.'
        // console.log('ShowMessage function not found.');
    }
}


function getIPOAllotment(html) {
    const $ = cheerio.load(html)
    // Extracting elements from the HTML
    // Extracting specific details

    const applicationNumber = $('#grid_results_ctl02_l1').text().trim();
    const category = $('#grid_results_ctl02_Label1').text().trim();
    const name = $('#grid_results_ctl02_Label2').text().trim();
    const dpIdClientId = $('#grid_results_ctl02_lbl_dpclid').text().trim();
    const pan = $('#grid_results_ctl02_lbl_pan').text().trim();
    const applied = $('#grid_results_ctl02_Label5').text().trim();
    const allotted = $('#grid_results_ctl02_lbl_allot').text().trim();

    // const applicationNumber = $('#l1').text().trim();
    // const category = $('#Label1').text().trim();
    // const name = $('#Label2').text().trim();
    // const dpIdClientId = $('#lbl_dpclid').text().trim();
    // const pan = $('#lbl_pan').text().trim();
    // const applied = $('#Label5').text().trim();
    // const allotted = $('#lbl_allot').text().trim();

    /* 
    console.log('Application Number:', applicationNumber);
    console.log('Category:', category);
    console.log('Name:', name);
    console.log('DP ID Client ID:', dpIdClientId);
    console.log('PAN:', pan);
    console.log('Applied:', applied);
    console.log('Alloted:', allotted);
 */
    return {
        'Application Number': applicationNumber,
        'Category': category,
        'Name': name,
        'DP ID Client ID': dpIdClientId,
        'PAN': pan,
        'Applied': applied,
        'Alloted': allotted
    };
}


const scrapeResultPage = (resp) => {
    const msg = decodeMessaage(resp)
    const data = getIPOAllotment(resp)
    if (msg == "ShowMessage function not found.") {
        return data;
    } else if (msg.toLowerCase().includes("captcha")) {
        return { Category: "Captcha is not valid" };
    } else if (msg.includes("PAN details  not available.")) {
        return { Category: "PAN details  not available." };
    } else {
        return msg;
    }
};

/* const executeCmd = async (company_id, pan, captcha) => {
    // console.log(`bash karvy.sh ${company_id} ${pan} ${captcha}`)
    return new Promise((resolve, reject) => {
        exec(`bash sites/karvy.sh ${company_id} ${pan} ${captcha}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.toString());
            }
        });
    });
};
 */
const getCaptcha = async (cookie) => {
    try {
        const result = execSync(`bash sites/captcha.sh ${cookie}`, { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Error:', error.message);
    }
};


async function readHeaders() {
    //get the cookie 

    const filePath = 'formattedCookies.json';
    const cookieData = await fsPromises.readFile(filePath, 'utf8');

    let cookie = JSON.parse(cookieData).Cookie
    var headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Cookie': 'ASP.NET_SessionId=h4vjang33quv2nhdvfzfzctu; __AntiXsrfToken=67ff87cd413d4ac2a99cfc04d3081fdd; TS01abe8f3=0176bf02ac91ddbc803431d6a490a964138807e71242dd69fef3e132985295ed742ba529cdcdfe49c1409844c90687e5c9447f17f6bd61a04c4332db5f73c89c7641e7b734f1838b956462e7dc7eff895cebe58da33104e5360afc81e4ad9a0d15cd4d04c8; TS01abe8f3=0176bf02acb653d8ebb9bb1668c6b65c1935c0fcebc090043431eb4793d3976a0e526501ce3d7567428d09791a0f98f17679b3bd8b802bff5a22cddcef49260c1d5fc2a07a925e56fedad19db7e67a20c545ae4095276b69e9a18da8b0a4e2838b09122a39',
        'Cookie': `${cookie}`,
        'Origin': 'https://kosmic.kfintech.com',
        'Referer': 'https://kosmic.kfintech.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }

    return headers
}


async function readFormData(formInputs) {

    const filePath = 'formInput.json';
    const formData = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(formData)
}


async function getIPOStatus(pan, company, captcha) {


    let formData = await readFormData();

    formData.__EVENTTARGET = 'btn_submit_query'
    formData.__EVENTARGUMENT = ''
    formData.__LASTFOCUS = ''
    formData.ddl_ipo = company
    formData.txt_applno = '++DQvBK0Qbuiym1bw08URQ=='
    formData.ddl_depository
    formData.txt_nsdl_dpid
    formData.txt_nsdl_clid
    formData.txt_cdsl_clid
    formData.txt_pan = pan
    formData.txt_captcha = captcha + ''
    formData.txt_conf_pan
    formData._h_query = 'pan'
    formData.req_src = ''


    delete formData.btn_multiple;

    let headers = await readHeaders()


    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://kosmic.kfintech.com/ipostatus/',
        headers: headers,
        data: formData
    };


    try {
        const resp = await axios.request(config);
        const data = scrapeResultPage(resp.data)
        return data;
    } catch (error) {
        console.log("ERROR OCCUR")
    }


}

let isCaptcha = false
let captchaCode;

async function processPan(PAN, company_id) {
    let data;
    const filePath = 'formattedCookies.json';
    const cookieData = await fsPromises.readFile(filePath, 'utf8');
    let cookie = JSON.parse(cookieData).Cookie

    if (!isCaptcha) {
        let capPng = await getCaptcha(cookie);
        captchaCode = await decodeCaptcha(capPng);
        isCaptcha = true
        if (captchaCode.length != 6) {
            isCaptcha = false;
            return processPan(PAN, company_id)
        }
        console.log(captchaCode);
        logger.info({ message: `Captcha Code: ${captchaCode}` });

    }
    if (captchaCode != 0) {
        data = await getIPOStatus(PAN, company_id, captchaCode)
        return data;
    } else {
        return null
    }

}

/* const processPan = async (PAN, company_id, maxRetries = 3) => {

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: "new",
        // headless: false
    });

    const page = await browser.newPage();
    // page.setDefaultTimeout(2000);
    await page.setViewport({ width: 1000, height: 800 });

    await page.goto('https://kosmic.kfintech.com/ipostatus/');


    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {

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
        const randomNumber = Math.random().toString(36).substr(2, 10);

        // Get the current timestamp and convert it to a string
        const timestamp = new Date().getTime().toString(36);

        // Combine the random number and timestamp to create a unique ID
        const randomId = randomNumber + timestamp;
        // Capture screenshot of the div

        let imgPath = `screnshot_${randomId}.png`
        await page.screenshot({
            path: imgPath,
            clip: {
                x: divBoundingBox.x,
                y: divBoundingBox.y,
                width: divBoundingBox.width,
                height: divBoundingBox.height,
            },
        });

        // Create the worker outside the inner function
        const captchaCode = await decodeCaptcha(imgPath)

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
                await browser.close()
                console.log(data)
                return data

            } catch (error) {

                console.log('Confirmation box appeared or timeout occurred. Handling this scenario...');

                const confirmationText = await page.evaluate(() => {
                    const confirmationBox = document.querySelector('.jconfirm-content');
                    return confirmationBox ? confirmationBox.textContent.trim() : null;
                });

                console.log("Processing PAN " + PAN)


                if (confirmationText.toLowerCase().includes('captcha')) {
                    console.log(`Retrying PAN ${PAN} due to CAPTCHA error. Retry count: ${retryCount + 1}`);
                    // Optionally, you can add a delay before retrying to avoid being blocked
                    await page.click('.jconfirm-buttons')
                    await page.waitForTimeout(1000);
                    console.log('Confirmation text:', confirmationText);
                } else {
                    console.log('Confirmation text: line 171: ', confirmationText);
                    await page.click('.jconfirm-buttons');
                    await browser.close()
                    return ({ PAN: PAN, QTY: confirmationText })
                }
            }


        }
    }
    await browser.close()
    return ({ PAN: PAN, QTY: "Not Able Process this PAN" })
} */

const karvyCaptcha = async (PAN, company_id = "INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT") => {
    const processPandata = [];
    const failedPandata = [];

    for (const Pan of PAN) {
        let retryAttempts = 3;
        let data;
        const { isPandata, pandata } = await checkIfCached(Pan, company_id)


        if (isPandata) {
            data = JSON.parse(pandata.result)
        } else {
            while (retryAttempts > 0) {
                data = await processPan(Pan, company_id);

                if (data && data?.Category && data.Category.includes("Captcha is not valid")) {
                    console.log(`Invalid captcha for PAN ${Pan}. Retrying (${retryAttempts} attempts left)`);
                    logger.info({ message: `Invalid captcha for PAN ${Pan}. Retrying (${retryAttempts} attempts left)` });

                    isCaptcha = false;
                    retryAttempts--;
                } else {
                    break; // Break out of the retry loop if captcha is valid
                }
            }
        }



        if (data && data.Category && data.Category.includes("Captcha is not valid")) {
            failedPandata.push({ ...data, PAN: Pan });
        } else if (data && data.Category && data.Category.includes("PAN details not available.")) {
            processPandata.push({ ...data, PAN: Pan });
        } else {
            processPandata.push({ ...data, PAN: Pan });
            if (!isPandata) {
                await cacheData(Pan, company_id, data);
            }
        }
    }

    failedPandata.forEach(element => {
        processPandata.push(element)
    });

    return { processPandata, failedPandata };
};






export { getKarvyIpoList, karvyCaptcha }

