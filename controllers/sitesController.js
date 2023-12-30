import { IPOList, bigshare, } from '../sites/bigshare.js';
import { getLinkinIpoList, executeCommand } from '../sites/linkintime.js';
import { getKarvyIpoList, karvyCaptcha } from '../sites/karvy.js';
import { v4 as uuidv4 } from 'uuid';
import xlsx from 'xlsx';
import { XMLParser } from "fast-xml-parser"
import { company } from '../Models/IpoList.js';
import asyncHandler from 'express-async-handler'
import path from 'path';
import { logger } from '../logger.js'
import { User } from '../Models/userModel.js';
import jwt from 'jsonwebtoken'
import { getPurvaIpoData, getPurvaIpoList } from '../sites/purva.js';
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
    } else if (sitename === 'Purva') {
        try {
            const existingCompany = await company.findOne({ site_name: 'Purva' });
            if (!existingCompany) {
                var result = await getPurvaIpoList();
                const resMap = result.map((e) => {
                    return { companyname: e.split("--")[1], company_id: e.split("--")[0] }
                })
                const newCompany = new company({
                    company_list: resMap,
                    site_name: "Purva",
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

        var pan_list = [];
        const id = uuidv4()
        const user = await getUser(req);
        let count = user.count;
        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
            const cellAddress = { c: panColumnIndex, r: rowNum };
            const cellRef = xlsx.utils.encode_cell(cellAddress);
            const pan = sheet[cellRef] ? sheet[cellRef].v : null;
            if (pan) {
                pan_list.push(pan.toUpperCase())
            }
        }
        const { processPandata: ipo, failedPandata } = await karvyCaptcha(pan_list, clientId);

        count = count - (ipo.length - failedPandata.length)
        // Convert JSON data to worksheet
        const filteredIpo = ipo.filter(item => item !== undefined);
        const ws = xlsx.utils.json_to_sheet(filteredIpo);
        // Create a workbook and add the worksheet
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');
        // Write the workbook to a file
        xlsx.writeFile(wb, `./uploads/KarvyIpoStatus_${id}.xlsx`);
        // Check if there are failed PANs before creating a workbook and writing to a file
        await updateUser(req, count)
        res.status(200).json({ success: `/download/KarvyIpoStatus_${id}.xlsx`, result: ipo, failed_data: failedPandata });

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
        const user = await getUser(req);
        let count = user.count;
        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
            const cellAddress = { c: panColumnIndex, r: rowNum };
            const cellRef = xlsx.utils.encode_cell(cellAddress);
            const pan = sheet[cellRef] ? sheet[cellRef].v : null;
            if (pan) {
                panList.push(pan.toUpperCase());
            }
        }
        const ipo = await bigshare(panList, clientId);
        const failed_data = ipo.failedPans
        const data = ipo.ipoStatusList
        count = count - data.length
        // Convert JSON data to worksheet
        const ws = xlsx.utils.json_to_sheet(data);
        // Create a workbook and add the worksheet
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');
        // Write the workbook to a file
        xlsx.writeFile(wb, `./uploads/BigShareIpoStatus_${id}.xlsx`);
        // Check if there are failed PANs before creating a workbook and writing to a file
        if (failed_data.length > 0) {
            failed_data.forEach((e) => {
                data.push({ PAN: e, Status: 'Failed' })
            })
        }
        await updateUser(req, count)
        res.status(200).json({ success: `/download/BigShareIpoStatus_${id}.xlsx`, result: data, failed_data: failed_data });
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
    const user = await getUser(req);
    let count = user.count;
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const cellAddress = { c: panColumnIndex, r: rowNum };
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        const pan = sheet[cellRef] ? sheet[cellRef].v : null;
        if (pan) {
            try {
                const { status, data } = await executeCommand(clientId, pan.replace(/\s/g, ''));
                if (status === 200) {
                    const val = JSON.parse(data);

                    if (val.d) {
                        const jObj = parser.parse(val.d);
                        // panList.push(jObj.NewDataSet);

                        if (jObj.NewDataSet === "") {
                            console.log("No able to parse this PAN: " + pan);

                            if (pan.length < 10) {
                                panList.push({ Pan: pan, Qty: "Enter the Valid Pan!!" });
                            } else {
                                panList.push({ Pan: pan, Qty: "No Record Found!!" });
                                count--;
                            }

                        } else {
                            var result = {
                                Pan: pan,
                                Qty: jObj.NewDataSet.Table?.ALLOT,
                                Name: jObj.NewDataSet.Table?.NAME1,
                                Cutoff_Price: jObj.NewDataSet.Table?.higher_priceband,
                                Security_Applied: jObj.NewDataSet.Table?.SHARES,
                                Category: jObj.NewDataSet.Table?.PEMNDG,
                            }
                            count--;
                            panList.push(result);
                        }
                    } else {
                        console.log("No able to parse this PAN: " + pan);
                        panList.push({ Pan: pan, Qty: "No Record Found!!" });
                        failedPans.push(pan);
                    }
                } else {
                    console.log("No able to parse this PAN: " + pan);
                    panList.push({ Pan: pan, Qty: "Error in getting the data!!" });
                    failedPans.push(pan);
                }
            } catch (error) {
                console.log(error);
                panList.push({ Pan: pan, Qty: "Not Able to get the data!!" });
                failedPans.push(pan);
            }
        }
    }
    await updateUser(req, count)
    // Create a new workbook and worksheet for successful PANs
    const resultWorkbook = xlsx.utils.book_new();
    const resultWorksheet = xlsx.utils.json_to_sheet(panList.flatMap(item => (item)));
    xlsx.utils.book_append_sheet(resultWorkbook, resultWorksheet, 'ResultSheet');
    const resultFileName = `LinkintimeIpoStatus_${id}.xlsx`;
    xlsx.writeFile(resultWorkbook, `./uploads/${resultFileName}`);
    res.status(200).json({ success: `/download/${resultFileName}`, result: panList, failed_data: failedPans, });
})



const getpurvaData = asyncHandler(async (req, res) => {

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
    const user = await getUser(req);
    let count = user.count;
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const cellAddress = { c: panColumnIndex, r: rowNum };
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        const pan = sheet[cellRef] ? sheet[cellRef].v : null;
        if (pan) {
             try {
                const data = await getPurvaIpoData(pan.replace(/\s/g, ''), clientId);
                var result = {
                    Pan: data['Pan No'],
                    Qty: data['Shares Allotted'],
                    Name: data['Name'],
                    'Shares Applied': data['Shares Applied'],
                    Category: data.Category,
                }
                count--;
                panList.push(result);

            } catch (error) {
                console.log(error);
                panList.push({ Pan: pan, Qty: "Not Able to get the data!!" });
                failedPans.push(pan);
            }
        }
    }
    await updateUser(req, count)
    // Create a new workbook and worksheet for successful PANs
    const resultWorkbook = xlsx.utils.book_new();
    const resultWorksheet = xlsx.utils.json_to_sheet(panList.flatMap(item => (item)));
    xlsx.utils.book_append_sheet(resultWorkbook, resultWorksheet, 'ResultSheet');
    const resultFileName = `PurvaIpoStatus_${id}.xlsx`;
    xlsx.writeFile(resultWorkbook, `./uploads/${resultFileName}`);
    res.status(200).json({ success: `/download/${resultFileName}`, result: panList, failed_data: failedPans, });
})


export {
    getbigshareData,
    getlinkintimeData,
    getKarvyData,
    getpurvaData,
    downloadFile,
    getIpoList
}


async function getUser(req) {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const database = await User.findById(decoded.id).select('-password')
            return database
        } catch (error) {
            console.error(error)
        }
    }
}

async function updateUser(req, count) {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Use findByIdAndUpdate to update the user count
            const updatedUser = await User.findByIdAndUpdate(
                decoded.id,
                { $set: { count: count } },
                { new: true } // This option returns the updated document
            ).select('-password');

            // Check if the user was found and updated
            if (updatedUser) {
                console.log('User count updated:', updatedUser);
                logger.info('User count updated: ' + updatedUser);

            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error(error);
        }
    }
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

