import axios from 'axios'
import cheerio from 'cheerio';
async function getSkylineIpoList() {
    const res = await axios.get('https://www.skylinerta.com/ipo.php');

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
    console.log(optionValues)
    return optionValues;
}


async function getSkylineIpoData(company_id = '140') {
    const res = await axios.get(`https://www.skylinerta.com/display_application.php?app=${company_id}`);

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
    console.log(optionValues)
    return optionValues;
}

getSkylineIpoData()