import axios from 'axios'
import cheerio from 'cheerio'
import { createWorker } from 'tesseract.js';
import Jimp from 'jimp';
import puppeteer from 'puppeteer'
import { executeCommand } from './sites/linkintime.js';

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
    } else {
        return msg;
    }
};


import { exec, execSync } from 'child_process';

const executeCmd = async (company_id, pan, captcha) => {
    // console.log(`bash karvy.sh ${company_id} ${pan} ${captcha}`)
    return new Promise((resolve, reject) => {
        exec(`bash karvy.sh ${company_id} ${pan} ${captcha}`, (error, stdout, stderr) => {
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
        const result = execSync('bash captcha.sh', { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Error:', error.message);
    }
};
async function getPanData(PAN, company_id) {

    const capPng = await getCaptcha()

    console.log(capPng)
    // Create the worker outside the inner function
    const captchaCode = await decodeCaptcha(capPng)

    console.log(captchaCode);

    const data = await executeCmd(company_id, PAN, captchaCode)
    // $ bash karvy.sh "INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT" "AEMPO5769C" "304512"
    // console.log(JSON.stringify(data.lines))
    return scrapeResultPage(data)


}


const karvyCaptcha = async (PAN = ["AEMPO5769C"], company_id = "INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT") => {

    const processPandata = [];

    for (const Pan of PAN) {
        // const data = await processPan(page, Pan, company_id)
        const data = await getPanData(Pan, company_id)

        processPandata.push(data)
    }

    console.log(processPandata)

}



async function decodeCaptcha(img) {

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
}




import { XMLParser } from "fast-xml-parser"
import { company } from './Models/IpoList.js';

const parser = new XMLParser()

async function linkintime() {
    const { status, data } = await executeCommand('11719', 'AXZPD8630M'.replace(/\s/g, ''));

    const val = JSON.parse(data)
    if (val.d) {
        const jObj = parser.parse(val.d);
        // panList.push(jObj.NewDataSet);

        if (jObj.NewDataSet === "") {
            console.log("No able to parse this PAN: ");



        }
    } else {
        console.log("No able to parse this : ");
    }
    console.log(val)
}



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
    }
}

// Example usage
// karvyCaptcha()



// Function that takes a callback
function karvyCaptcha1(panList, clientId, callback) {
    // Simulating an asynchronous operation
    setTimeout(() => {
        const result = {
            processPandata: 'Processed PAN data',
            failedPandata: 'Failed PAN data'
        };

        // Call the callback with the result
        callback(null, result);
    }, 1000); // Simulating a 1-second delay
}

// Callback function to handle the results
function handleKarvyCaptchaResults(error, data) {
    if (error) {
        console.error('Error in karvyCaptcha:', error);
    } else {
        // Process the results here
        console.log('Processed PAN data:', data.processPandata);
        console.log('Failed PAN data:', data.failedPandata);

        // Add more logic as needed
    }
}

// Call karvyCaptcha with the callback every second
setInterval(() => {
    karvyCaptcha1(['pan1', 'pan2'], 'client123', handleKarvyCaptchaResults);
}, 1000);
