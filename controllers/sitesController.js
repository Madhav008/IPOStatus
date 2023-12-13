import { IPOList, bigshare, } from '../sites/bigshare.js';
import { getLinkinIpoList, executeCommand } from '../sites/linkintime.js';
import { getKarvyIpoList, karvyCaptcha } from '../sites/karvy.js';
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';
import { XMLParser } from "fast-xml-parser"
import { company } from '../Models/IpoList.js';
import asyncHandler from 'express-async-handler'
import path from 'path';
const publicDirectoryPath = path.join('uploads');


const parser = new XMLParser();

const downloadFile = asyncHandler(async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(publicDirectoryPath, fileName);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error while sending file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
})


const getIpoList = asyncHandler(async (req, res) => {
    const sitename = req.params.id; // Assuming you want to access the parameter from the route

    if (sitename === 'Linkintime') {


        try {
            // Check if the company with the given clientId exists in the database
            const existingCompany = await company.findOne({ site_name: 'Linkintime' });
            if (!existingCompany) {
                const result = await getLinkinIpoList();
                const val = JSON.parse(result);
                if (val.d) {
                    const jObj = parser.parse(val.d);
                    const newCompany = new company({
                        company_list: jObj.NewDataSet.Table,
                        site_name: "Linkintime",
                    });
                    await newCompany.save();
                    res.status(200).json(jObj.NewDataSet.Table)
                }
            } else {
                res.status(200).json(existingCompany.company_list)
            }
        } catch (error) {

            console.error('Error:', error);
        }
    } else if (sitename === 'Bigshare') {
        const existingCompany = await company.findOne({ site_name: 'Bigshare' });
        if (!existingCompany) {
            var result = await IPOList();
            result = result.slice(1)
            const resMap = result.map((e) => {
                return { companyname: e.split("--")[0], company_id: e.split("--")[1] }
            })
            const newCompany = new company({
                company_list: resMap,
                site_name: "Bigshare",
            });
            await newCompany.save();
            res.status(200).send(resMap);
        } else {
            res.status(200).json(existingCompany.company_list)
        }
    } else if (sitename === 'Karvy') {
        try {
            const existingCompany = await company.findOne({ site_name: 'Karvy' });
            if (!existingCompany) {
                var result = await getKarvyIpoList();
                result = result.slice(1)
                const resMap = result.map((e) => {
                    return { companyname: e.split("--")[0], company_id: e.split("--")[1] }
                })
                const newCompany = new company({
                    company_list: resMap,
                    site_name: "Karvy",
                });
                await newCompany.save();
                res.status(200).send(resMap);
            } else {
                res.status(200).json(existingCompany.company_list)
            }
        } catch (error) {

            console.error('Error:', error);
        }
    } else {
        // Handle the case when sitename doesn't match any of the specified values
        res.status(404).send('Invalid sitename');
    }
});



const getKarvyData = asyncHandler(async (req, res) => {
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
        var panList = [];

        var failed_panlist = []
        var panData = [];
        const id = uuidv4()
        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
            const cellAddress = { c: panColumnIndex, r: rowNum };
            const cellRef = xlsx.utils.encode_cell(cellAddress);
            const pan = sheet[cellRef] ? sheet[cellRef].v : null;
            if (pan) {
                panList.push(pan);
                try {
                    const ipo = await karvyCaptcha(pan, clientId);
                    panData.push(ipo)
                } catch (error) {
                    // Handle errors by logging and adding to failed_panlist
                    failed_panlist.push(pan);
                }
            }
        }
        const failed_data = failed_panlist
        const data = panData
        // Convert JSON data to worksheet
        const ws = xlsx.utils.json_to_sheet(data);
        // Create a workbook and add the worksheet
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');
        // Write the workbook to a file
        xlsx.writeFile(wb, `./uploads/KarvyIpoStatus_${id}.xlsx`);
        // Check if there are failed PANs before creating a workbook and writing to a file
        if (failed_data.length > 0) {
            // Convert failed IPO data to worksheet
            const failedWs = xlsx.utils.json_to_sheet(failed_data.map(pan => ({ PAN: pan, Status: 'Failed' })));
            // Create a workbook and add the worksheet for failed data
            const failedWb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(failedWb, failedWs, 'FailedIpoList');
            // Write the workbook to a file for failed data
            xlsx.writeFile(failedWb, `./uploads/FailedIpoList_${id}.xlsx`);
            res.status(200).json({ success: `/download/KarvyIpoStatus_${id}.xlsx`, failed: `/download/FailedIpoList_${id}.xlsx`, result: data, failed_data: failed_data });

        } else {
            res.status(200).json({ success: `/download/KarvyIpoStatus_${id}.xlsx`, result: data, failed_data: failed_data });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

const getbigshareData = asyncHandler(async (req, res) => {
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

const getlinkintimeData = asyncHandler(async (req, res) => {

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



export {
    getbigshareData,
    getlinkintimeData,
    getKarvyData,
    downloadFile,
    getIpoList
}





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

