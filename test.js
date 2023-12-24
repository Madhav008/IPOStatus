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
    } else if (msg.toLowerCase().includes("captcha")) {
        return { Category: "Captcha is not valid" };
    } else if (msg.includes("PAN details  not available.")) {
        return { Category: "PAN details  not available." };
    } else {
        return msg;
    }
};


import { exec, execSync } from 'child_process';

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
    }
};
let isCaptcha = false
let captchaCode;
async function getPanData(PAN, company_id) {
    if (!isCaptcha) {
        let capPng = await getCaptcha();
        captchaCode = await decodeCaptcha(capPng);
        isCaptcha = true
        if (captchaCode.length != 6) {
            isCaptcha = false;
            return getPanData(PAN, company_id)
        }
        console.log(captchaCode);
    }


    let data = await executeCmd(company_id, PAN, captchaCode)
    // $ bash karvy.sh "INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT" "AEMPO5769C" "304512"
    // console.log(JSON.stringify(data.lines))
    data = scrapeResultPage(data)

    console.log(data)
    if (data.Category.includes('Captcha')) {
        isCaptcha = false;
        return getPanData(PAN, company_id)
    }
    return data

}


const karvyCaptcha = async (PAN = ["AEMPO5769C", "JJRPK7016R",
    "JJRPK7016R",
    "JJRPK7016R",
    "JJRPK9850B",
    "JJRPK9850B",
    "JJRPS5470P",
    "JJRPS5470P",
    "JJSPS1407M",
    "JJSPS1407M",
    "JJSPS4504P",
    "JJSPS4504P",
    "JJSPS4504P",
    "JJSPS4504P",
    "JJSPS4504P",
    "JJTPK2375B",
    "JJTPK2375B",
    "JJTPK4799H",
    "JJTPK4799H",
    "JJTPK4799H",
    "JJTPK9335P",
    "JJTPK9335P",
    "JJTPS6671A",
    "JJTPS6671A",
    "JJTPS6703R",
    "JJTPS6703R",
    "JJTPS6703R",
    "JJTPS7283C",
    "JJTPS7283C",
    "JJUPS2764H",
    "JJUPS2764H",
    "JJUPS4814N",
    "JJUPS4814N",
    "JJUPS5946B",
    "JJUPS5946B",
    "JJUPS5946B",
    "JJUPS6121L",
    "JJUPS6121L",
    "JJVPK5015A",
    "JJVPK5015A",
    "JJVPS2972G",
    "JJVPS2972G",
    "JJVPS4752L",
    "JJVPS4752L",
    "JJVPS4940G",
    "JJVPS4940G",
    "JJVPS5369P",
    "JJVPS5369P",
    "JJVPS6835N",
    "JJVPS6835N",
    "JJVPS8620B",
    "JJVPS8620B",
    "JJWPK3611R",
    "JJWPK3611R",
    "JJWPS2212A",
    "JJWPS2212A",
    "JJWPS2308H",
    "JJWPS2308H",
    "JJWPS7554H",
    "JJWPS7554H",
    "JJWPS8827M",
    "JJWPS8827M",
    "JJWPS9989A",
    "JJWPS9989A",
    "JJXPK2619Q",
    "JJXPK2619Q",
    "JJXPK5670K",
    "JJXPK5670K",
    "JJXPK8240K",
    "JJXPK8240K",
    "JJXPK8497L",
    "JJXPK8497L",
    "JJXPS0320A",
    "JJXPS0320A",
    "JJXPS1524N",
    "JJXPS1524N",
    "JJXPS3719F",
    "JJXPS3719F",
    "JJXPS4980L",
    "JJXPS4980L",
    "JJYPK2126M",
    "JJYPK2126M",
    "JJYPS4926K",
    "JJYPS4926K",
    "JJYPS5753J",
    "JJYPS5753J",
    "JJYPS6375G",
    "JJYPS6375G",
    "JJYPS6375G",
    "JJYPS6375G",
    "JJYPS7058L",
    "JJYPS7058L",
    "JJYPS7098C",
    "JJYPS7098C",
    "JJYPS8441D",
    "JJYPS8441D",
    "JJYPS8634C",
    "JJYPS8634C",
    "JJYPS8634C",
    "JJYPS8634C",
    "JJZPK5471G",
    "JJZPK5471G",
    "JJZPK5656R",
    "JJZPK5656R",
    "JJZPK6352Q",
    "JJZPK6352Q",
    "JJZPK6434F",
    "JJZPK6434F",
    "JJZPK6464B",
    "JJZPK6464B",], company_id = "INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT") => {

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
karvyCaptcha()



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
// setInterval(() => {
//     karvyCaptcha1(['pan1', 'pan2'], 'client123', handleKarvyCaptchaResults);
// }, 1000);



async function getIPOStatus(Pan) {
    try {
        let data = JSON.stringify({
            "ipoId": 70,
            "panNumber": Pan,
            "reload": false
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.trynarada.com/get-allotment-status/',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    } catch (error) {
        co, nsole.error('Error:', error);
    }
}
// Functio,n that takes a callback
async function karvyCaptchaApi() {
    let panlist = [
        "JJRPK7016R",
        "JJRPK7016R",
        "JJRPK9850B",
        "JJRPK9850B",
        "JJRPS5470P",
        "JJRPS5470P",
        "JJSPS1407M",
        "JJSPS1407M",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJTPK2375B",
        "JJTPK2375B",
        "JJTPK4799H",
        "JJTPK4799H",
        "JJTPK4799H",
        "JJTPK9335P",
        "JJTPK9335P",
        "JJTPS6671A",
        "JJTPS6671A",
        "JJTPS6703R",
        "JJTPS6703R",
        "JJTPS6703R",
        "JJTPS7283C",
        "JJTPS7283C",
        "JJUPS2764H",
        "JJUPS2764H",
        "JJUPS4814N",
        "JJUPS4814N",
        "JJUPS5946B",
        "JJUPS5946B",
        "JJUPS5946B",
        "JJUPS6121L",
        "JJUPS6121L",
        "JJVPK5015A",
        "JJVPK5015A",
        "JJVPS2972G",
        "JJVPS2972G",
        "JJVPS4752L",
        "JJVPS4752L",
        "JJVPS4940G",
        "JJVPS4940G",
        "JJVPS5369P",
        "JJVPS5369P",
        "JJVPS6835N",
        "JJVPS6835N",
        "JJVPS8620B",
        "JJVPS8620B",
        "JJWPK3611R",
        "JJWPK3611R",
        "JJWPS2212A",
        "JJWPS2212A",
        "JJWPS2308H",
        "JJWPS2308H",
        "JJWPS7554H",
        "JJWPS7554H",
        "JJWPS8827M",
        "JJWPS8827M",
        "JJWPS9989A",
        "JJWPS9989A",
        "JJXPK2619Q",
        "JJXPK2619Q",
        "JJXPK5670K",
        "JJXPK5670K",
        "JJXPK8240K",
        "JJXPK8240K",
        "JJXPK8497L",
        "JJXPK8497L",
        "JJXPS0320A",
        "JJXPS0320A",
        "JJXPS1524N",
        "JJXPS1524N",
        "JJXPS3719F",
        "JJXPS3719F",
        "JJXPS4980L",
        "JJXPS4980L",
        "JJYPK2126M",
        "JJYPK2126M",
        "JJYPS4926K",
        "JJYPS4926K",
        "JJYPS5753J",
        "JJYPS5753J",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS7058L",
        "JJYPS7058L",
        "JJYPS7098C",
        "JJYPS7098C",
        "JJYPS8441D",
        "JJYPS8441D",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJZPK5471G",
        "JJZPK5471G",
        "JJZPK5656R",
        "JJZPK5656R",
        "JJZPK6352Q",
        "JJZPK6352Q",
        "JJZPK6434F",
        "JJZPK6434F",
        "JJZPK6464B",
        "JJZPK6464B",
        "JJZPK6671J",
        "JJZPK6671J",
        "JJZPS1820P",
        "JJZPS1820P",
        "JJZPS3205J",
        "JJZPS3205J",
        "JKAPK2486P",
        "JKAPK2486P",
        "JKAPK2609Q",
        "JKAPK2609Q",
        "JKAPK6027A",
        "JKAPK6027A",
        "JKAPK8030D",
        "JKAPK8030D",
        "JKAPK8030D",
        "JKAPK8030D",
        "JKAPK9140L",
        "JKAPK9140L",
        "JKAPS0643N",
        "JKAPS0643N",
        "JKAPS2201A",
        "JKAPS2201A",
        "JKAPS9642M",
        "JKAPS9642M",
        "JKAPS9689Q",
        "JKAPS9689Q",
        "JKAPS9740A",


    ]


    for (const panNumber of panlist) {
        var pan = panNumber

        await getIPOStatus(pan);

    }
}
// karvyCaptchaApi()