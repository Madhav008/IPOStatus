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
    console.log(JSON.stringify(data))
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
    "JJZPK6464B",], company_id = "AZAD~azad_engltdfv2~0~26/12/2023~26/12/2023~EQT") => {

    const processPandata = [];

    for (const Pan of PAN) {
        // const data = await processPan(Pan, company_id)
        const data = await getPanData(Pan, company_id)

        processPandata.push(data)
    }

    console.log(processPandata)

}

const processPan = async (PAN, company_id, maxRetries = 3) => {

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // headless: "new",
        headless: false
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
        const captchaCode = await decodeCaptcha('screenshot.png')

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




// fetch("https://evault.kfintech.com/ipostatus/", {
//     "headers": {
//         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//         "accept-language": "en-US,en;q=0.9",
//         "cache-control": "no-cache",
//         "content-type": "application/x-www-form-urlencoded",
//         "pragma": "no-cache",
//         "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"Windows\"",
//         "sec-fetch-dest": "document",
//         "sec-fetch-mode": "navigate",
//         "sec-fetch-site": "same-origin",
//         "sec-fetch-user": "?1",
//         "upgrade-insecure-requests": "1"
//     },
//     "referrer": "https://evault.kfintech.com/",
//     "referrerPolicy": "strict-origin",
//     "body": "__EVENTTARGET=btn_submit_query&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=F%2BKg9dTfhH6TNtnpNhTB%2BqYYaZKRi8w6sSp%2B3AFz1VxEUUZnl4UMDfqbZO6dURwqkAHcpebDiH5apeOVkVrlGIb1sNWwt309hx%2Fuq6jYg92kJ%2BogCswtBCM4BR0AE5ihSj6ZAbX%2BR0zI2XBexkC45gMhJKIT8h4eWQ%2FQKjwKl2y01L%2BwgIfOk0r3VaB3LHazd1TerEiU2xuKqMQ3Fq8N7FqgHoA9fzR6b9KeydSmp4uM1oOAIiPV7q4WrTdmEfTRB54SKzHCJQEEvmbMsa94uNqMFIQCnt4zGUwo9cLKsXwJkK2iHMn1EueCPiJizAZ0qCOBAQHY8fOg47Cw5d8dSyP9n%2BWgfTk9GqR76OcyuC%2Bt8TfbhR9jCkOWWidui59qRPekdJXNICYBevovWW%2F%2BJLtVhtuSwOJvdl3sOiLve9to7l1hHhrqG5inCSaQFyvKdDS%2Fo4hd7tD7wk%2FyNRiKZtbSeKN8JoVdQVVVigmn6Os%2B3lbUcPOtN%2BNtPLxLa38GqVV1ydcuLhc2PAYxBCDHfN%2BbQT6jG3CX67my9u5OQ62GhEHQ62RAsM5jBxLnlk8msOrd9bFCYCL90utOvBUzeGG7UcdvNcXNWIsJHWhsPphCPnfZhuhBkqls70Hl0LO0vKgzJatTOW7dpwO2WQD1P4R9bqr9Rpi0hkJNSpUTCJmn29r%2Bj%2FaBlNZwMET3J1t0c4M95JHfquDDvpsj04T%2BtX7LFVDtF8a1thYJUmvu6TU7%2BvKtaV8EUXV14PXAVYyHfzhsx9Q5En0V3fLWLv3ypGowB2d2C8Tssxz2DktTlh9H893DmrOq6fdFjgfpdOBr2uw6y5XFUJ5T5dfTVXtsMiPmeeV62VbYDzgsLWieFaQ5ztDfWGXeyObOTE5zM47wIsRzUUJH8Mmna9ea5iAuBe7vGAjlcWl%2Bpc2VJBOem5B%2BUWfwY4Wb6b602Dv00CR7gQik952xzK7wLG0dEmbTzNJ3fA8SiDGnt%2Fj3c8smtb3pETL9crRHWyQ0r1vUEbY1oCGSF%2FaNyAD70IC7sKjue9n5Sc3YK13ZAsFlXrN%2Fr4PEGGrAplKIV8Ie7AsUVwbds6GYgezg%2BoRac6Cg0RzT0JtYXuve0lsdxDo9RkFioPFaYh%2FzpNqyRF44SOljQbfIGlv5d5XFmHBL2pOfO2Nun1VVaQ0lNeYBc41LHF%2FQKsr4luyilif%2BxJA5zTT2n1y77itDEpRTGtz0k88XIjafIl6LIqwFTUTrhfFtTcWAXvh%2FTz%2BgDZTGt4Q%2BqcUx75PuTwP2KOghe7%2Fp6BmBo8beUnyBOXaL0OkQkByOoz82u%2FsNLMFMRl8%2FoGpBH6jIMP7b%2F7KN41x2CQB2eN2DNCzksv2Bu7NFEyDV7oWEXnN6YRC7OsEsNuM0LHKriugCTWBbewWHxSX5cAdbhSTwul73tpJKszArm9shKaEN641HWid2ztIxvdiiL4it2FeRpaUZ%2BhlhGtX0xZwRyRsvb0Qn%2BOFYKP%2BnjTRes8MOZs%2FxLIZas83gQraG4yRerbGbUUe5o3F1vh8BvqtHgX6StlsFc1cXQrZ7YztbJQJHw0%2Fm8n0JtxjLidTtPu3AGdSmDdGKw0bhLclaXMA8ts5QgaW0vmuE3YJey4NQOZm7HJz67w3M5LlMzgRTBCYxGCnE2HrDgva1Uh1ZstJIShxZSr8LoA%3D%3D&__VIEWSTATEGENERATOR=7CE23556&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=R1uVKHCC1cb%2FxAbzON%2BXNTCBxxQZTGjCmvlAHGpgJ9wbbOZ8hs0TArRrv7jW%2FvUVnSWwzE22qIDxwpZlbBZklFD6dN85osn7eRiRFdo6r%2BgedyX5zd7WLeWRziG%2FUGmjHPxZwGNStjntGfN9B8l79TdYaqzY%2BYnMeFUo0auIKdpVtFp0NZp9rIxxnD0GOA4YxzHRvfb5mBoH31Z7JdnlEKMt4FXMIYOpnvoC0dSr89nr9iUe8VcPnXtSncC6kHEG4omznwYB4JUDELu18VboNh46j3usjqF%2F86lX6wPS%2Byd5P0KP5nH3BRvcRIAo8%2FPY8xuuYo3bKyQX6I%2BY5Rt7%2Bhlg3JPefSppQGBv2qWbV7Mjchhlf0RPU8GU5q6flbBHLgatJq4roH4vGbL17QO5tAlcwBZo0g6IrFQjgVJcVO2zZuKhAE%2F%2B8d3c%2FQRe2K0M61qzPWGtQZB9m%2BjIM9%2Fg2n%2BrQ2yiCD%2FY7CvAXOA4%2Bz6gCCfbZFl2aQOW7xtzUMfdEO%2FpJPIMAhs%2F%2F%2BS0f8uGg0kwz%2B%2BRWSR1iom0H395UK0ByQBLs%2BA33MiHyG2mwJlsLr1tkWUUXb%2FJvnyw%2FzZtNg%3D%3D&chkOnOff=on&ddl_ipo=AZAD%7Eazad_engltdfv2%7E0%7E26%2F12%2F2023%7E26%2F12%2F2023%7EEQT&query=pan&txt_applno=&ddl_depository=N&txt_nsdl_dpid=&txt_nsdl_clid=&txt_cdsl_clid=&txt_pan=9%2Fo6BpHfINyDu9gnnrI99w%3D%3D&txt_captcha=403079&txt_conf_pan=&_h_query=pan&encrypt_payload=Y&req_src=",
//     "method": "POST",
//     "mode": "cors",
//     "credentials": "include"
// }).then(response => response.text())
//     .then(data => console.log(data))
//     .catch(error => console.error('Error:', error));