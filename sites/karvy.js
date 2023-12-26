import { createWorker } from 'tesseract.js';

import Jimp from 'jimp';
import axios from 'axios'
import cheerio from 'cheerio'
import { exec, execSync } from 'child_process';
import { logger } from '../logger.js';
import { cacheData, checkIfCached } from '../controllers/cacheController.js';

const getKarvyIpoList = async () => {
    try {
        const response = await axios.get('https://kprism.kfintech.com/ipostatus/');
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
    const applicationNumber = $('#l1').text().trim();
    const category = $('#Label1').text().trim();
    const name = $('#Label2').text().trim();
    const dpIdClientId = $('#lbl_dpclid').text().trim();
    const pan = $('#lbl_pan').text().trim();
    const applied = $('#Label5').text().trim();
    const allotted = $('#lbl_allot').text().trim();

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

const executeCmd = async (company_id, pan, captcha) => {
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

const getCaptcha = async () => {
    try {
        const result = execSync('bash sites/captcha.sh', { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Error:', error.message);
        logger.error({ message: 'Error:' + error });

    }
};

let isCaptcha = false
let captchaCode;
async function processPan(PAN, company_id) {
    let data;
    if (!isCaptcha) {
        let capPng = await getCaptcha();
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
        data = await executeCmd(company_id, PAN, captchaCode);
        data = scrapeResultPage(data)
        return data;
    } else {
        return null
    }

}

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

