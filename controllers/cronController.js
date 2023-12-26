
import asyncHandler from 'express-async-handler'
import cron from 'node-cron';
import { company } from '../Models/IpoList.js';
import { getLinkinIpoList } from '../sites/linkintime.js';
import { getKarvyIpoList } from '../sites/karvy.js';
import { IPOList } from '../sites/bigshare.js';
import { XMLParser } from 'fast-xml-parser'
import { logger } from '../logger.js';

const parser = new XMLParser()
let cronJob;

const start = asyncHandler(async (req, res) => {
    const cronExpression = '0 */3 * * *'; // Run every day every 3 hours

    cronJob = cron.schedule(cronExpression, async () => {
        await updateDocuments();
    });

    res.status(200).json({ message: 'Cron job started successfully.' });
});
const status = asyncHandler(async (req, res) => {
    try {
        // Check if the cron job is running
        // Adjust this based on your actual cron job object
        let isRunning = false;
        if (cronJob) {
            isRunning = true
        }
        // Assuming you have a method to update documents
        // await updateDocuments();

        res.status(200).json({ status: isRunning ? 'Running' : 'Not Running' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const stop = asyncHandler(async (req, res) => {
    // Stop the cron job
    if (cronJob) {
        cronJob.destroy();
        cronJob = null;
        res.status(200).json({ message: 'Cron job stopped successfully.' });
    } else {
        res.status(200).json({ message: 'Cron job is not running.' });
    }
});

export {
    start, status, stop
};

async function updateDocuments() {
    try {
        // Update document for Linkintime
        await updateDocument('Linkintime');

        // Update document for Bigshare
        await updateDocument('Bigshare');

        // Update document for Karvy
        await updateDocument('Karvy');

    } catch (error) {
        logger.error({ message: `Error updating documents:, ${error}` });
    }
}

async function updateDocument(sitename) {
    try {
        const list = await getIpoListData(sitename);

        const newData = {
            site_name: sitename,
            company_list: list
        };

        // Use findOneAndUpdate with upsert option to handle cases where the document doesn't exist
        const result = await company.findOneAndUpdate(
            { site_name: sitename },
            newData,
            { new: true, upsert: true }
        );

        logger.info({ message: `Document updated for ${sitename}: ${result} document(s) modified` });
    } catch (error) {
        logger.error({ message: `Error updating document for ${sitename}: ${error}` });
    }
}


const getIpoListData = async (sitename) => {
    try {
        if (sitename === 'Linkintime') {
            const result = await getLinkinIpoList();
            const val = JSON.parse(result);

            if (val.d) {
                const jObj = parser.parse(val.d);
                return jObj.NewDataSet.Table;
            }
        } else if (sitename === 'Bigshare') {
            var result = await IPOList();
            result = result.slice(1);
            const resMap = result.map((e) => ({
                companyname: e.split("--")[0],
                company_id: e.split("--")[1]
            }));
            return resMap;
        } else if (sitename === 'Karvy') {
            var result = await getKarvyIpoList();
            result = result.slice(1);
            const resMap = result.map((e) => ({
                companyname: e.split("--")[0],
                company_id: e.split("--")[1]
            }));
            return resMap;
        } else {
            // Throw an error for invalid sitename
            throw new Error('Invalid sitename');
        }
    } catch (error) {
        logger.error({ message: `Error  ${sitename}: ${error}` });
        throw error; // Rethrow the error for the calling function to handle
    }
};