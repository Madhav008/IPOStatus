import axios from 'axios'
import asyncHandler from 'express-async-handler'
import cheerio from 'cheerio'
const getIpoList = asyncHandler(async (req, res) => {
    try {
        // Use fs.readdirSync to get the list of items in the directory
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://dash.ipopremium.in/api/ipo/get',
            headers: {
                'Authorization': 'Bearer JYvIxWJyA26388svPUGKThDBuMyyCZgVxMnzMpv6V5zGKvXK9AyV8gtTKkWh',
                'Cookie': 'XSRF-TOKEN=eyJpdiI6ImZWSXBLWWl6cVhFcFVSd3RBdmRtN2c9PSIsInZhbHVlIjoiRmZzU3lReFVCWWx1UERXZkh5Q2l6NlJza25IY2NUcnd1cDVRdUdrVkt3dmFYenR2Y2NJNmY3QWRXeEFDekpGT29BY1EybUppUitRZjJ2YTlOaCtPMzIwYzc1WmlmSVdobEo2XC9BdDRUc0J1WDF3UVd4VTNydFpmNVdVazB6eHdXIiwibWFjIjoiNjNlZTdhOGI3ZWM3MzJkNDU3MzA2NDM1MWY0YTE0ZDUwNmM4MGY1MWFlODAyNmJhZDFhYjcwODM4YWQxNmRkNCJ9; ipopremium_session=eyJpdiI6InBtRmpsXC9aaTNjVElQY1h1ekhuZllBPT0iLCJ2YWx1ZSI6InlONVpUeVdxWU92dzlmYXZGWkZVM3NQelwvTGhGeGFDWmVrSGJLRGtOd1BneHZvU1JsQzVhZktoMmVLR2Zud05kOVZKWGVESGNtVlpnek1IREFZMEVia2g3cVNtaGZkODRQK1ZMZTRnbjhSdjZpMzljcmtuZUR2Z3p2SGhrSTYyeiIsIm1hYyI6IjEyY2E1OWQxOWE2NjllZjMyZTE1OTJjNWFiNmQzYzY3ZWMzNDA1NzcyMDAxY2IwYjdmZTc2NTBmODAyZDFiY2EifQ%3D%3D'
            }
        };


        const resp = await axios.request(config)
        res.status(200).json(resp.data)

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

const getIpoDetails = asyncHandler(async (req, res) => {

    const { id } = req.params
    try {
        // Use fs.readdirSync to get the list of items in the directory
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://dash.ipopremium.in/api/ipo/' + id,
            headers: {
                'Authorization': 'Bearer JYvIxWJyA26388svPUGKThDBuMyyCZgVxMnzMpv6V5zGKvXK9AyV8gtTKkWh',
                'Cookie': 'XSRF-TOKEN=eyJpdiI6ImZWSXBLWWl6cVhFcFVSd3RBdmRtN2c9PSIsInZhbHVlIjoiRmZzU3lReFVCWWx1UERXZkh5Q2l6NlJza25IY2NUcnd1cDVRdUdrVkt3dmFYenR2Y2NJNmY3QWRXeEFDekpGT29BY1EybUppUitRZjJ2YTlOaCtPMzIwYzc1WmlmSVdobEo2XC9BdDRUc0J1WDF3UVd4VTNydFpmNVdVazB6eHdXIiwibWFjIjoiNjNlZTdhOGI3ZWM3MzJkNDU3MzA2NDM1MWY0YTE0ZDUwNmM4MGY1MWFlODAyNmJhZDFhYjcwODM4YWQxNmRkNCJ9; ipopremium_session=eyJpdiI6InBtRmpsXC9aaTNjVElQY1h1ekhuZllBPT0iLCJ2YWx1ZSI6InlONVpUeVdxWU92dzlmYXZGWkZVM3NQelwvTGhGeGFDWmVrSGJLRGtOd1BneHZvU1JsQzVhZktoMmVLR2Zud05kOVZKWGVESGNtVlpnek1IREFZMEVia2g3cVNtaGZkODRQK1ZMZTRnbjhSdjZpMzljcmtuZUR2Z3p2SGhrSTYyeiIsIm1hYyI6IjEyY2E1OWQxOWE2NjllZjMyZTE1OTJjNWFiNmQzYzY3ZWMzNDA1NzcyMDAxY2IwYjdmZTc2NTBmODAyZDFiY2EifQ%3D%3D'
            }
        };


        const resp = await axios.request(config)
        res.status(200).json(resp.data)

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

const getIpoGraph = asyncHandler(async (req, res) => {

    const { id } = req.params
    try {
        // Use fs.readdirSync to get the list of items in the directory
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://dash.ipopremium.in/view/ipoGraph/' + id,
        };


        const resp = await axios.request(config)

        const html = resp.data;
        const $ = cheerio.load(html)

        const scriptTag = $('script').last(); // Assuming the chart script is the last script tag

        // Extract the content inside the script tag
        const scriptContent = scriptTag.html();

        // Parse the script content to extract the chart data
        const match = /data:\s*(\[.*?\])/s.exec(scriptContent);
        const chartData = match ? JSON.parse(match[1]) : null;

        // Print or use the extracted chart data
        console.log(chartData);
        // Print or use the extracted script content
        res.status(200).json(chartData)

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

export {
    getIpoList, getIpoDetails, getIpoGraph
}



const extractGraph = async (html) => {
    const $ = cheerio.load(html)

    // Extract the content inside the script tag
    const scriptContent = $('script').html();

    // Print or use the extracted script content
    console.log(scriptContent);
}