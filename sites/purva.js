import cheerio from 'cheerio'
import axios from 'axios'
import qs from 'qs'
import { logger } from '../logger.js';

async function getPurvaIpoList() {
    const res = await axios.get('https://www.purvashare.com/queries/');

    let $ = cheerio.load(res.data);
    const optionValues = [];

    // Iterate over each 'select' element
    $('select').each((index, element) => {
        const selectId = $(element).attr('id');

        $('select#' + selectId + ' option').each((index, element) => {
            const optionValue = $(element).val();
            const optionContent = $(element).text();

            // Add the option value and content to the list
            optionValues.push(`${optionValue}--${optionContent}`);
        });

    });

    optionValues.shift()

    return optionValues;
}

async function getPurvaIpoData(PAN = 'AEMPO5964C', company = 'SUPEQUIP') {


    let data = qs.stringify({
        'company': company,
        'applicationNumber': '',
        'panNumber': PAN,
        'is_form_submit': 'true'
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.purvashare.com/queries/index.php',
        headers: {
            'authority': 'www.purvashare.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'dnt': '1',
            'origin': 'https://www.purvashare.com',
            'pragma': 'no-cache',
            'referer': 'https://www.purvashare.com/queries/',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        data: data
    };

    const res = await axios.request(config)

    const $ = cheerio.load(res.data);

    // Check if there is an alert
    const alertExists = $('.alert').length > 0;

    if (alertExists) {
        // Extract data from the alert
        const message = $('.alert h4').text();

        const jsonData = {
            "Pan No": PAN,
            "Shares Allotted": message,
        }
        logger.info({ message: JSON.stringify(jsonData) })

        return jsonData;

    } else {
        // Extract data from the table
        const jsonData = [];

        $('table tbody tr').each((index, row) => {
            const rowData = {};
            $(row).find('td').each((colIndex, col) => {
                const header = $('table thead th').eq(colIndex).text().trim();
                const value = $(col).text().trim();
                rowData[header] = value;
            });
            jsonData.push(rowData);
        });


        logger.info({ message: JSON.stringify(jsonData) })
        return jsonData
    }

}
export {
    getPurvaIpoList, getPurvaIpoData
}