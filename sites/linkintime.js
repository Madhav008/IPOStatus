import { exec } from 'child_process';
import { company } from "../Models/IpoList.js";
import { logger } from '../logger.js';

const getLinkinIpoList = async (clientId, pan) => {
    return new Promise((resolve, reject) => {
        exec(`bash sites/getIpoLiist.sh`, (error, stdout, stderr) => {
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
        exec(`bash sites/linkintime.sh ${clientId} ${pan} ${keyWord}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                const lines = stdout.split('\n');
                // Extract the status code from the first line
                const statusLine = lines[0];
                const statusCode = statusLine.match(/HTTP\/1\.\d (\d+)/)[1];
                const status = statusCode ? parseInt(statusCode, 10) : null;
                // Join the remaining lines to get the response body
                const body = lines.slice(1).join('\n');
                const bodyArray = body.split('\n');
                const data = bodyArray[bodyArray.length - 1];

                logger.info({ status, data })
                // Resolve with an object containing status and responseBody
                resolve({ status, data });
            }
        });
    });
};




export { getLinkinIpoList, executeCommand }
executeCommand(11719, "AFJPS3657R")