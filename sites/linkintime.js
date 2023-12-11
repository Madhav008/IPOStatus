import { exec } from 'child_process';
import { company } from "../Models/IpoList.js";

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
                resolve(stdout);
            }
        });
    });
};





export { getLinkinIpoList, executeCommand }