import axios from 'axios'
import asyncHandler from 'express-async-handler'
import cheerio from 'cheerio'
import { redisClient } from '../redis.js';
import { logger } from '../logger.js';
const getIpoList = asyncHandler(async (req, res) => {
    try {
        // Use fs.readdirSync to get the list of items in the directory
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://dash.ipopremium.in/api/ipo/get',
            headers: {
                'Authorization': 'Bearer JYvIxWJyA26388svPUGKThDBuMyyCZgVxMnzMpv6V5zGKvXK9AyV8gtTKkWh'
            }
        };

        const cachedata = await redisClient.get('ipolist');

        if (cachedata != null) {
            console.log("CACHE HIT")
            res.status(200).json(JSON.parse(cachedata))
        } else {
            console.log("CACHE MISS")
            const resp = await axios.request(config)
            await redisClient.setEx('ipolist', 360, JSON.stringify(resp.data));
            res.status(200).json(resp.data)
        }

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
                'Authorization': 'Bearer JYvIxWJyA26388svPUGKThDBuMyyCZgVxMnzMpv6V5zGKvXK9AyV8gtTKkWh'
            }
        };

        const cachedata = await redisClient.get(`ipolist${id}`);

        if (cachedata != null) {
            console.log("CACHE HIT")
            res.status(200).json(JSON.parse(cachedata))
        } else {
            console.log("CACHE MISS")
            const resp = await axios.request(config)
            await redisClient.setEx(`ipolist${id}`, 360, JSON.stringify(resp.data));
            res.status(200).json(resp.data)
        }

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



        const cachedata = await redisClient.get(`ipolist_view${id}`);

        if (cachedata != null) {
            console.log("CACHE HIT")
            res.status(200).json(JSON.parse(cachedata))
        } else {
            console.log("CACHE MISS")
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
            logger.info({ message: chartData });


            await redisClient.setEx(`ipolist_view${id}`, 360, JSON.stringify(chartData));
            res.status(200).json(chartData)
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

export {
    getIpoList, getIpoDetails, getIpoGraph
}