import { User } from '../Models/userModel.js';
import asyncHandler from 'express-async-handler'
import path from 'path';
import fs from 'fs'
import xlsx from 'xlsx';
import { excel } from '../Models/ExcelModel.js';
import { v4 as uuidv4 } from 'uuid';



const getFolders = asyncHandler(async (req, res) => {
    var targetDir = './CompanyFiles'
    try {
        // Use fs.readdirSync to get the list of items in the directory
        const items = fs.readdirSync(targetDir);

        // Filter out only the folders
        const folders = items.filter(item => fs.statSync(path.join(targetDir, item)).isDirectory());

        res.json({ folders });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});


const seedDataIntoMongoDB = async (folder, files, targetDir) => {
    try {
        for (const file of files) {
            const filePath = path.join(targetDir, file);
            console.log(filePath);
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Iterate over each data item and save directly to the database
            for (const item of data) {
                const excelData = new excel({
                    Company_Name: folder,
                    ASBASRL: item.ASBASRL,
                    BNKCODE: item.BNKCODE,
                    APPLNO: item.APPLNO,
                    TMNAME: item.TMNAME,
                    PANGIR1: item.PANGIR1,
                    DPCLITID: item.DPCLITID,
                    ORDER_NO: item.ORDER_NO,
                    BOOK_ID: item.BOOK_ID,
                    BRANCH: item.BRANCH,
                    USR_ID: item.USR_ID,
                    SHARES: item.SHARES,
                    AMOUNT: item.AMOUNT,
                    ALLOT: item.ALLOT,
                    NAME1: item.NAME1,
                    REASON: item.REASON,
                });

                await excelData.save();
            }
        }

        console.log('Data seeded into MongoDB successfully.');
    } catch (error) {
        console.error('Error seeding data into MongoDB:', error);
    }
};


const getTheFiles = asyncHandler(async (req, res) => {
    var { folder } = req.params;
    var targetDir = `./CompanyFiles/${folder}`;
    try {
        const items = fs.readdirSync(targetDir);
        const files = items.filter(item => fs.statSync(path.join(targetDir, item)).isFile());

        res.json({ files });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const UploadTheData = asyncHandler(async (req, res) => {
    var { folder } = req.params;
    var targetDir = `./CompanyFiles/${folder}`;
    try {
        const items = fs.readdirSync(targetDir);
        const files = items.filter(item => fs.statSync(path.join(targetDir, item)).isFile());

        await seedDataIntoMongoDB(folder, files, targetDir);

        res.json({ files });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const getResult = asyncHandler(async (req, res) => {
    const { pan } = req.params;
    const panUpperCase = pan.toUpperCase();

    try {
        const result = await excel.findOne({ PANGIR1: panUpperCase })
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const getUploadedFileData = asyncHandler(async (req, res) => {
    const { company_name } = req.body;

    if (!company_name) {
        return res.status(400).json({ error: 'company name is required in the request body' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = req.files.file;

    const workbook = xlsx.read(uploadedFile.data, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const panColumnIndex = findColumnIndex(sheet, 'PAN');
    if (panColumnIndex === -1) {
        return res.status(400).json({ error: 'PAN NO column not found' });
    }

    const range = xlsx.utils.decode_range(sheet['!ref']);

    var pan_list = [];
    var panData = [];
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

    for (const pan of pan_list) {
        const ipo = await excel.findOne({ PANGIR1: pan.toUpperCase(), Company_Name: company_name });
        if (ipo) {
            var cleaned_data = {
                Company_Name: ipo.Company_Name,
                ASBASRL: ipo.ASBASRL,
                BNKCODE: ipo.BNKCODE,
                APPLNO: ipo.APPLNO,
                TMNAME: ipo.TMNAME,
                PANGIR1: ipo.PANGIR1,
                DPCLITID: ipo.DPCLITID,
                ORDER_NO: ipo.ORDER_NO,
                BOOK_ID: ipo.BOOK_ID,
                SHARES: ipo.SHARES,
                AMOUNT: ipo.AMOUNT,
                ALLOT: ipo.ALLOT,
                NAME1: ipo.NAME1,
                REASON: ipo.REASON,
            }

            panData.push(cleaned_data);
            count--;
        } else {
            panData.push({ PANGIR1: pan, REASON: 'No record found' });
        }
    }

    const ws = xlsx.utils.json_to_sheet(panData);


    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'IpoStatus');

    xlsx.writeFile(wb, `./uploads/excel_${id}.xlsx`);
    await updateUser(req, count)
    res.status(200).json({ success: `/download/excel_${id}.xlsx`, result: panData });


})



export {
    getFolders, getTheFiles, UploadTheData, getResult, getUploadedFileData
}


import jwt from 'jsonwebtoken'

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