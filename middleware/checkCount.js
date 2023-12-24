import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { User } from '../Models/userModel.js'
import xlsx from 'xlsx';

const checkCount = asyncHandler(async (req, res, next) => {
    let panCount
    let token

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
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const cellAddress = { c: panColumnIndex, r: rowNum };
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        const pan = sheet[cellRef] ? sheet[cellRef].v : null;
        if (pan) {
            pan_list.push(pan.toUpperCase())
        }
    }

    panCount = pan_list.length
    let databaseCount;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            const database = await User.findById(decoded.id).select('-password')

            databaseCount = database.count;


            if (databaseCount >= panCount) {
                next()
            }


        } catch (error) {
            console.error(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    }

    if (databaseCount < panCount) {
        res.status(401).json({ message: "Not authorized" })
    }
})

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401).json({ message: "Not authorized as an admin" })

    }
}

export { checkCount }


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