import { exec } from 'child_process';
import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import fileUpload from 'express-fileupload';
import xlsx from 'xlsx';


import { XMLParser } from "fast-xml-parser"
const parser = new XMLParser();

const app = express();
const port = process.env.PORT || 3001;
app.use(fileUpload());

// Enable CORS for all routes (modify as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Set up proxy for 

app.get('/getStatus', async (req, res) => {

  const result = await IPOList()
  res.send(result)
})


app.get('/karvy', async (req, res) => {
  await karvyCaptcha()
  const data = await uploadImageAndReceiveResponse('screenshot.png')
  const numbersOnly = data.result.replace(/[^\d]/g, '');

  console.log('Numbers only:', data);

  res.json({ "result": numbersOnly })
})
// Other routes and middleware can be added as needed
function findColumnIndex(sheet, columnName) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
    const cellAddress = { c: colNum, r: range.s.r };
    const cellRef = xlsx.utils.encode_cell(cellAddress);
    const cellValue = sheet[cellRef] ? sheet[cellRef].v : null;

    if (cellValue && cellValue.trim().toUpperCase() === columnName.trim().toUpperCase()) {
      return colNum;
    }
  }

  return -1;
}

app.post('/bigshare', async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Access the uploaded file
    const uploadedFile = req.files.file; // Assuming the file input has the name 'file'
    // Read the Excel file
    const workbook = xlsx.read(uploadedFile.data, { type: 'buffer' });
    // Assuming your data is in the first sheet (change as needed)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Find the column index of the PAN column
    const panColumnIndex = findColumnIndex(sheet, 'PAN NO');
    if (panColumnIndex === -1) {
      return res.status(400).json({ error: 'PAN NO column not found' });
    }
    // Collect all PANs in the sheet
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const panList = [];
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      const cellAddress = { c: panColumnIndex, r: rowNum };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const pan = sheet[cellRef] ? sheet[cellRef].v : null;
      if (pan) {
        panList.push(pan);
      }
    }
    const ipo = await bigshare(panList);
    const failed_data = ipo.failedPans
    const data = ipo.ipoStatusList
    // Convert JSON data to worksheet
    const ws = xlsx.utils.json_to_sheet(data);
    // Create a workbook and add the worksheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');
    // Write the workbook to a file
    xlsx.writeFile(wb, 'IpoStatus.xlsx');
    // Check if there are failed PANs before creating a workbook and writing to a file
    if (failed_data.length > 0) {
      // Convert failed IPO data to worksheet
      const failedWs = xlsx.utils.json_to_sheet(failed_data.map(pan => ({ PAN: pan, Status: 'Failed' })));
      // Create a workbook and add the worksheet for failed data
      const failedWb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(failedWb, failedWs, 'FailedIpoList');
      // Write the workbook to a file for failed data
      xlsx.writeFile(failedWb, 'FailedIpoList.xlsx');
    }
    res.json({ result: data, failed_data: failed_data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})



app.get('/linkintime', async (req, res) => {

  const clientId = '11717';
  const pan = 'EBDPR5546G';

  // const { clientId, pan } = req.body
  const data = await executeCommand(clientId, pan)
  const val = JSON.parse(data);

  console.log(val.d)
  let jObj = parser.parse(val.d);
  res.json({ "result": jObj })
})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



const executeCommand = async (clientId, pan) => {
  const keyWord = 'PAN';
  return new Promise((resolve, reject) => {
    exec(`bash linkintime.sh ${clientId} ${pan} ${keyWord}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};






const uploadImageAndReceiveResponse = async () => {
  const apiUrl = 'http://localhost:5000/upload';  // Replace with the actual API endpoint
  const path = 'screenshot.png';

  const formData = new FormData();

  formData.append('file', fs.createReadStream(path), { filename: path });

  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error; // Rethrow the error to propagate it
  }
};


//TODO pending work of purva


const IPOList = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Navigate to the website
    await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');
    // Wait for the page to load
    await page.waitForSelector('#ddlCompany');
    // Extract uncommented options from the select element
    const options = await page.evaluate(() => {
      const selectElement = document.querySelector('#ddlCompany');
      const optionElements = selectElement.querySelectorAll('option:not(:disabled)'); // Select only uncommented options
      const optionValues = Array.from(optionElements).map(option => option.textContent.trim() + "--" + option.value);
      return optionValues;
    });

    return options;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
};

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


const bigshare = async (panList) => {
  const ipoList = await IPOList();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    // headless: false
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');
    await page.waitForSelector('#ddlCompany');

    const ipoStatusList = [];
    const failedPans = [];

    const retryBigshare = async (PAN) => {
      try {
        await page.select('#ddlCompany', ipoList[1].split("--")[1]);
        await page.waitForSelector('#txtpan');
        await page.select('#ddlSelectionType', 'PN');
        await page.type('#txtpan', `${PAN}`);
        const sessionData = await page.evaluate(() => sessionStorage.getItem('captchaCode'));
        const captchadata = JSON.parse(sessionData);

        // Check if captchadata is present
        if (captchadata) {
          await sleep(100);
          await page.type('#captcha-input', captchadata + '');
          await page.click('#btnSearch');
          await page.waitForSelector('#dPrint');
          await sleep(200);

          const data = await page.evaluate(() => {
            const tableRows = document.querySelectorAll('#dPrint table tbody tr');
            const rowData = {};

            tableRows.forEach((row) => {
              const th = row.querySelector('th');
              const td = row.querySelector('td');

              if (th && td) {
                const key = th.textContent.trim();
                const value = td.textContent.trim();
                rowData[key] = value;
              }
            });

            return rowData;
          });

          await page.click('#btnclear');
          await page.reload();
          await sleep(100);

          // Remove PAN from failedPans after successful retry
          const index = failedPans.indexOf(PAN);
          if (index !== -1) {
            failedPans.splice(index, 1);
          }

          return data;
        } else {
          console.error(`Captcha data not available for PAN ${PAN}. Adding to failedPans.`);
          failedPans.push(PAN);
          return null;
        }
      } catch (error) {
        console.error(`Failed to retrieve data for PAN ${PAN} even after retry.`);
        return null;
      }
    };

    for (const PAN of panList) {
      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          const data = await retryBigshare(PAN);

          if (data) {

            var finaldata = {
              ...data,
              PAN: PAN
            }
            console.log(`Data for PAN ${PAN}:`, JSON.stringify(finaldata, null, 2));
            ipoStatusList.push(finaldata);
            success = true;
          } else {
            console.error(`Failed attempt for PAN ${PAN}. Retrying...`);
            retries--;
            await sleep(1000);
            await page.reload()
          }
        } catch (error) {
          console.error(`Error processing PAN ${PAN}:`, error);
        }
      }

      if (!success) {
        console.error(`Failed to retrieve data for PAN ${PAN} after retries.`);
        failedPans.push(PAN);
      }
    }

    // Retry failed PANs
    for (const failedPAN of failedPans) {
      const data = await retryBigshare(failedPAN);
      if (data) {
        console.log(`Data for PAN ${failedPAN} (after retry):`, JSON.stringify(data, null, 2));
        ipoStatusList.push(data);
      }
    }

    return { ipoStatusList, failedPans };
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
};



const karvyCaptcha = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    // headless: false
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




