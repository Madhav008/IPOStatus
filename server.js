import { exec } from 'child_process';
import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import fileUpload from 'express-fileupload';
import xlsx from 'xlsx';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createWorker } from 'tesseract.js';



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

// Use import.meta.url to get the current file's URL
const currentFileUrl = import.meta.url;


const publicDirectoryPath = path.join('uploads');
app.use(express.static(publicDirectoryPath));

// Set up proxy for 


app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(publicDirectoryPath, fileName);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error while sending file:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

app.get('/getIpoList/:id', async (req, res) => {
  const sitename = req.params.id; // Assuming you want to access the parameter from the route

  if (sitename === 'Linkintime') {
    const result = await getLinkinIpoList();
    const val = JSON.parse(result);
    if (val.d) {
      const jObj = parser.parse(val.d);

      res.status(200).json(jObj.NewDataSet.Table)
    }
  } else if (sitename === 'Bigshare') {
    var result = await IPOList();
    result = result.slice(1)
    const resMap = result.map((e) => {
      return { companyname: e.split("--")[0], company_id: e.split("--")[1] }
    })
    res.send(resMap);
  } else if (sitename === 'Karvy') {
    // Add your logic for the 'Karvy' case here
    // For example: const result = await karvyIpoList();
    // res.send(result);
  } else {
    // Handle the case when sitename doesn't match any of the specified values
    res.status(404).send('Invalid sitename');
  }
});




app.get('/karvy', async (req, res) => {
  try {
    // Assuming karvyCaptcha returns a promise
    await karvyCaptcha();

    // Create the worker outside the inner function
    const worker = await createWorker('eng');

    const ret = await worker.recognize('screenshot.png');
    console.log(ret.data.text);

    // Extract digits from the recognized text
    const numbersOnly = ret.data.text.match(/\d+/g);

    // Check if numbersOnly is not null or undefined before applying join
    const result = numbersOnly ? numbersOnly.join('') : '';
    await worker.terminate();

    res.json({ result: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




function isColumnMatch(cellValue, columnNameUpperCase, colNum) {
  const cellValueUpperCase = cellValue?.trim().toUpperCase();

  return (
    cellValueUpperCase === columnNameUpperCase ||
    cellValueUpperCase?.startsWith('PAN') ||
    colNum.toString().trim().toUpperCase() === 'PAN' ||
    cellValue?.trim().toLowerCase() === columnNameUpperCase.toLowerCase() ||
    cellValue?.toLowerCase().startsWith('pan')
  );
}


function findColumnIndex(sheet, columnName) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const columnNameUpperCase = columnName.trim().toUpperCase();

  for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
    const cellAddress = { c: colNum, r: range.s.r };
    const cellRef = xlsx.utils.encode_cell(cellAddress);
    const cellValue = sheet[cellRef]?.v;

    if (isColumnMatch(cellValue, columnNameUpperCase, colNum)) {
      return colNum;
    }
  }

  return -1;
}





app.post('/bigshare', async (req, res) => {
  try {

    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required in the request body' });
    }

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
    const panColumnIndex = findColumnIndex(sheet, 'PAN');
    if (panColumnIndex === -1) {
      return res.status(400).json({ error: 'PAN NO column not found' });
    }
    // Collect all PANs in the sheet
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const panList = [];
    const id = uuidv4()
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      const cellAddress = { c: panColumnIndex, r: rowNum };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const pan = sheet[cellRef] ? sheet[cellRef].v : null;
      if (pan) {
        panList.push(pan);
      }
    }
    const ipo = await bigshare(panList, clientId);
    const failed_data = ipo.failedPans
    const data = ipo.ipoStatusList
    // Convert JSON data to worksheet
    const ws = xlsx.utils.json_to_sheet(data);
    // Create a workbook and add the worksheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');
    // Write the workbook to a file
    xlsx.writeFile(wb, `./uploads/IpoStatus_${id}.xlsx`);
    // Check if there are failed PANs before creating a workbook and writing to a file
    if (failed_data.length > 0) {
      // Convert failed IPO data to worksheet
      const failedWs = xlsx.utils.json_to_sheet(failed_data.map(pan => ({ PAN: pan, Status: 'Failed' })));
      // Create a workbook and add the worksheet for failed data
      const failedWb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(failedWb, failedWs, 'FailedIpoList');
      // Write the workbook to a file for failed data
      xlsx.writeFile(failedWb, `./uploads/FailedIpoList_${id}.xlsx`);
      res.status(200).json({ success: `/download/IpoStatus_${id}.xlsx`, failed: `/download/FailedIpoList_${id}.xlsx`, result: data, failed_data: failed_data });

    } else {
      res.status(200).json({ success: `/download/IpoStatus_${id}.xlsx`, result: data, failed_data: failed_data });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})




app.post('/linkintime', async (req, res) => {

  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required in the request body' });
  }

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
  const panColumnIndex = findColumnIndex(sheet, 'PAN');
  if (panColumnIndex === -1) {
    return res.status(400).json({ error: 'PAN NO column not found' });
  }
  // Collect all PANs in the sheet
  const range = xlsx.utils.decode_range(sheet['!ref']);
  const panList = [];
  const failedPans = [];
  const id = uuidv4()
  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const cellAddress = { c: panColumnIndex, r: rowNum };
    const cellRef = xlsx.utils.encode_cell(cellAddress);
    const pan = sheet[cellRef] ? sheet[cellRef].v : null;
    if (pan) {
      try {
        const data = await executeCommand(clientId, pan.replace(/\s/g, ''));
        const val = JSON.parse(data);

        if (val.d) {
          const jObj = parser.parse(val.d);
          panList.push(jObj.NewDataSet);
        } else {
          console.log("No able to parse this PAN: " + pan);
          failedPans.push(pan);
        }
      } catch (error) {
        console.log(error);
        failedPans.push(pan);
      }
    }
  }
  // Create a new workbook and worksheet for successful PANs
  const resultWorkbook = xlsx.utils.book_new();
  const resultWorksheet = xlsx.utils.json_to_sheet(panList.flatMap(item => (item.Table ? item.Table : [])));
  xlsx.utils.book_append_sheet(resultWorkbook, resultWorksheet, 'ResultSheet');
  const resultFileName = `result_${id}.xlsx`;
  xlsx.writeFile(resultWorkbook, `./uploads/${resultFileName}`);


  // Create a new workbook and worksheet for failed PANs
  if (failedPans.length > 0) {
    const failedWorkbook = xlsx.utils.book_new();
    const failedWorksheet = xlsx.utils.json_to_sheet(failedPans.map(pan => ({ PAN: pan, Status: 'Failed' })));
    xlsx.utils.book_append_sheet(failedWorkbook, failedWorksheet, 'FailedPanList');
    const failedFileName = `failed_pans_${id}.xlsx`;
    xlsx.writeFile(failedWorkbook, `./uploads/${failedFileName}`);

    res.status(200).json({ success: `/download/${resultFileName}`, failed: `/download/${failedFileName}`, result: panList, failed_data: failedPans, });

  } else {
    res.status(200).json({ success: `/download/${resultFileName}`, result: panList, failed_data: failedPans, });
  }
})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



const getLinkinIpoList = async (clientId, pan) => {
  return new Promise((resolve, reject) => {
    exec(`bash getIpoLiist.sh`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};



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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless:"new"
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


const bigshare = async (panList, company_id) => {
  // const ipoList = await IPOList();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');
    await page.waitForSelector('#ddlCompany');

    const ipoStatusList = [];
    const failedPans = [];

    const retryBigshare = async (PAN) => {
      try {
        await page.select('#ddlCompany', company_id);
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
              PAN: PAN,
              ...data
            }
            // console.log(`Data for PAN ${PAN}:`, JSON.stringify(finaldata, null, 2));
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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
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







