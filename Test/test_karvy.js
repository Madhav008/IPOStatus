import axios from 'axios';
import cheerio from 'cheerio'
import tough from 'tough-cookie';
import fs from 'fs'
import { promises as fsPromises } from 'fs';
import { createWorker } from 'tesseract.js';
import Jimp from 'jimp';
import { exec, execSync } from 'child_process';


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







function getIPOAllotment(html) {
    const $ = cheerio.load(html);

    // Extracting elements from the HTML
    // Extracting specific details
    const applicationNumber = $('#grid_results_ctl02_l1').text().trim();
    const category = $('#grid_results_ctl02_Label1').text().trim();
    const name = $('#grid_results_ctl02_Label2').text().trim();
    const dpIdClientId = $('#grid_results_ctl02_lbl_dpclid').text().trim();
    const pan = $('#grid_results_ctl02_lbl_pan').text().trim();
    const applied = $('#grid_results_ctl02_Label5').text().trim();
    const allotted = $('#grid_results_ctl02_lbl_allot').text().trim();

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


async function getCookies() {
    const cookiejar = new tough.CookieJar();

    try {
        // Make an HTTP request to the URL to fetch cookies
        const response = await axios.get("https://kosmic.kfintech.com/ipostatus/", {
            jar: cookiejar, // Pass the cookie jar to axios
            withCredentials: true, // Include credentials (cookies) in the request
        });
        await getFormEvents(response.data)
        // Check for "Set-Cookie" headers in the response and update the cookie jar
        var cokkies = []
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            for (const setCookieHeader of setCookieHeaders) {
                var cookie = setCookieHeader.split(';')[0]
                cokkies.push(cookie)
                // const parsedCookie = tough.Cookie.parse(setCookieHeader)
                // await cookiejar.setCookie(parsedCookie, "https://kosmic.kfintech.com/ipostatus/");
            }
        }

        // Print the cookies after the request
        // const cookies = await cookiejar.getCookies("https://kosmic.kfintech.com/ipostatus/");
        return cokkies;
    } catch (error) {
        console.error(error);
    }
}

async function getFormEvents(html) {
    try {

        // Load HTML content into Cheerio
        const $ = cheerio.load(html);

        // Extract data from the specified <div>
        const formInputs = {};
        $('form input').each((index, element) => {
            const inputName = $(element).attr('name');
            const inputValue = $(element).attr('value');
            formInputs[inputName] = inputValue;
        });

        const jsonString = JSON.stringify(formInputs, null, 2);

        // Specify the file path where you want to save the JSON data
        const filePath = 'formInput.json';

        // Write the JSON data to the file
        fs.writeFile(filePath, jsonString, 'utf-8', (err) => {
            if (err) {
                console.error('Error saving to file:', err);
            } else {
                console.log(`Formatted Form Input saved to ${filePath}`);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function formatCookies() {
    try {
        const formattedCookiesArray = await getCookies();
        console.log(formattedCookiesArray);

        const formattedCookies = formattedCookiesArray.map(cookie => {
            const parts = cookie.split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            return `${name}=${encodeURIComponent(value)}`;
        });

        const formattedHeaders = {
            Cookie: formattedCookies.join('; ')
        };


        const jsonString = JSON.stringify(formattedHeaders, null, 2);

        // Specify the file path where you want to save the JSON data
        const filePath = 'formattedCookies.json';

        // Write the JSON data to the file
        fs.writeFile(filePath, jsonString, 'utf-8', (err) => {
            if (err) {
                console.error('Error saving to file:', err);
            } else {
                console.log(`Formatted cookies and headers saved to ${filePath}`);
            }
        });
    } catch (error) {
        console.error('Error saving to file:', error);
    }
}

// Example usage:
formatCookies();

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




const getCaptcha = async (cookie) => {
    try {
        const result = execSync(`bash sites/captcha.sh ${cookie}`, { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

let isCaptcha = false
let captchaCode;
async function getPanData(PAN, company_id) {


    const filePath = 'formattedCookies.json';
    const cookieData = await fsPromises.readFile(filePath, 'utf8');

    let cookie = JSON.parse(cookieData).Cookie


    if (!isCaptcha) {
        let capPng = await getCaptcha(cookie);
        captchaCode = await decodeCaptcha(capPng);
        isCaptcha = true
        if (captchaCode.length != 6) {
            isCaptcha = false;
            return getPanData(PAN, company_id)
        }
        console.log(captchaCode);
    }


    const data = await getIPOStatus(PAN, company_id, captchaCode)
    if (data.Category.includes('Captcha')) {
        isCaptcha = false;
        return getPanData(PAN, company_id)
    }
    return data;
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
        return null;
    }

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

const karvyCaptcha = async (PAN = ["AEMPO5769C", "JJZPK6464B",], company_id = "INNC~innova_captabltd~0~27/12/2023~27/12/2023~EQT") => {

    const processPandata = [];

    for (const Pan of PAN) {
        // const data = await processPan(Pan, company_id)
        const data = await getPanData(Pan, company_id)
        // const data = await getIPOStatus(Pan, company_id, "460343")

        processPandata.push(data)
    }

    console.log(processPandata)
}

karvyCaptcha()