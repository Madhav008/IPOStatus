import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_APP_BACKEND_URL;

// Define Axios requests for each of your endpoints
const axiosInstance = axios.create({
    baseURL,
});

// Set Bearer token in the headers for each request except login
axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig): any => {
        // Add your Bearer token here
        const token = Cookies.get('authToken');
        // Ensure config.headers is initialized as an empty object
        config.headers = config.headers || {};

        // Exclude the Authorization header for the login request
        if (token && !config.url?.includes('login')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const apiEndpoints = {
    getIpoData: 'api/:sitename',
    getIpoList: 'api/getIpoList/:sitename',
    login: 'api/users/login',
    getProfile: 'api/users/profile',
    getFolders: 'getExcel/all',
    getExcelResult: 'getExcel/data',


};

// Define functions to make Axios requests for your endpoints
const makeRequest = async <T>(url: string, method: string = 'GET', data: any = null): Promise<any> => {
    try {
        const response: AxiosResponse<T> = await axiosInstance({
            method,
            url,
            data,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const ipoStatusApi = {
    getIpoList: <T>(sitename: string): Promise<any> => makeRequest<T>(apiEndpoints.getIpoList.replace(':sitename', sitename)),
    getIpoData: <T>(sitename: string, requestData: any): Promise<any> => makeRequest<T>(apiEndpoints.getIpoData.replace(':sitename', sitename), 'POST', requestData),
    login: <T>(requestData: any): Promise<T> => makeRequest<T>(apiEndpoints.login, 'POST', requestData),
    getProfile: <T>(): Promise<any> => makeRequest<T>(apiEndpoints.getProfile),
    getFolders: <T>(): Promise<any> => makeRequest<T>(apiEndpoints.getFolders),
    getExcelResult: <T>(requestData: any): Promise<any> => makeRequest<T>(apiEndpoints.getExcelResult, 'POST', requestData),
};
