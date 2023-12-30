import cheerio from 'cheerio'
import axios from 'axios'
import qs from 'qs'

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



// getIpoList()


async function getIpoData(PAN = 'AEMPO5964C', company = 'SUPEQUIP') {

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

        // Log the alert data
        console.log('Alert Data:');
        console.log({
            "Pan No": PAN,
            "Application Number": message,
        });
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

        // Log the table data
        console.log('Table Data:');
        console.log(jsonData);
    }
}



async function purvaShare() {
    let pans = ["AEMPO5769C", "JJRPK7016R", "JJRPK7016R", "JJRPK7016R", "JJRPK9850B", "JJRPK9850B",
        "JJRPS5470P",
        "JJRPS5470P",
        "JJSPS1407M",
        "JJSPS1407M",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJSPS4504P",
        "JJTPK2375B",
        "JJTPK2375B",
        "JJTPK4799H",
        "JJTPK4799H",
        "JJTPK4799H",
        "JJTPK9335P",
        "JJTPK9335P",
        "JJTPS6671A",
        "JJTPS6671A",
        "JJTPS6703R",
        "JJTPS6703R",
        "JJTPS6703R",
        "JJTPS7283C",
        "JJTPS7283C",
        "JJUPS2764H",
        "JJUPS2764H",
        "JJUPS4814N",
        "JJUPS4814N",
        "JJUPS5946B",
        "JJUPS5946B",
        "JJUPS5946B",
        "JJUPS6121L",
        "JJUPS6121L",
        "JJVPK5015A",
        "JJVPK5015A",
        "JJVPS2972G",
        "JJVPS2972G",
        "JJVPS4752L",
        "JJVPS4752L",
        "JJVPS4940G",
        "JJVPS4940G",
        "JJVPS5369P",
        "JJVPS5369P",
        "JJVPS6835N",
        "JJVPS6835N",
        "JJVPS8620B",
        "JJVPS8620B",
        "JJWPK3611R",
        "JJWPK3611R",
        "JJWPS2212A",
        "JJWPS2212A",
        "JJWPS2308H",
        "JJWPS2308H",
        "JJWPS7554H",
        "JJWPS7554H",
        "JJWPS8827M",
        "JJWPS8827M",
        "JJWPS9989A",
        "JJWPS9989A",
        "JJXPK2619Q",
        "JJXPK2619Q",
        "JJXPK5670K",
        "JJXPK5670K",
        "JJXPK8240K",
        "JJXPK8240K",
        "JJXPK8497L",
        "JJXPK8497L",
        "JJXPS0320A",
        "JJXPS0320A",
        "JJXPS1524N",
        "JJXPS1524N",
        "JJXPS3719F",
        "JJXPS3719F",
        "JJXPS4980L",
        "JJXPS4980L",
        "JJYPK2126M",
        "JJYPK2126M",
        "JJYPS4926K",
        "JJYPS4926K",
        "JJYPS5753J",
        "JJYPS5753J",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS6375G",
        "JJYPS7058L",
        "JJYPS7058L",
        "JJYPS7098C",
        "JJYPS7098C",
        "JJYPS8441D",
        "JJYPS8441D",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJYPS8634C",
        "JJZPK5471G",
        "JJZPK5471G",
        "JJZPK5656R",
        "JJZPK5656R",
        "JJZPK6352Q",
        "JJZPK6352Q",
        "JJZPK6434F",
        "JJZPK6434F",
        "JJZPK6464B",
        "JJZPK6464B",]
    const company_data = await getPurvaIpoList()
    for (const Pan of pans) {
        console.log(Pan)

        await getIpoData(Pan)
    }
}

purvaShare()