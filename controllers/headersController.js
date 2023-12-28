import axios from 'axios';
import cheerio from 'cheerio'
import tough from 'tough-cookie';
import fs from 'fs'

async function getCookies() {
    const cookiejar = new tough.CookieJar();

    try {
        // Make an HTTP request to the URL to fetch cookies
        const response = await axios.get("https://kosmic.kfintech.com/ipostatus/", {
            jar: cookiejar, // Pass the cookie jar to axios
            withCredentials: true, // Include credentials (cookies) in the request
        });
        await getFormEvents(response.data)
        // Check for "Set-Cookie" headers in the response and update the cookie jar
        var cokkies = []
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            for (const setCookieHeader of setCookieHeaders) {
                var cookie = setCookieHeader.split(';')[0]
                cokkies.push(cookie)
            }
        }
        return cokkies;
    } catch (error) {
        console.error(error);
    }
}

async function getFormEvents(html) {
    try {

        // Load HTML content into Cheerio
        const $ = cheerio.load(html);

        // Extract data from the specified <div>
        const formInputs = {};
        $('form input').each((index, element) => {
            const inputName = $(element).attr('name');
            const inputValue = $(element).attr('value');
            formInputs[inputName] = inputValue;
        });

        const jsonString = JSON.stringify(formInputs, null, 2);

        // Specify the file path where you want to save the JSON data
        const filePath = 'formInput.json';

        // Write the JSON data to the file
        fs.writeFile(filePath, jsonString, 'utf-8', (err) => {
            if (err) {
                console.error('Error saving to file:', err);
            } else {
                console.log(`Formatted Form Input saved to ${filePath}`);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function formatCookies() {
    try {
        const formattedCookiesArray = await getCookies();
        console.log(formattedCookiesArray);

        const formattedCookies = formattedCookiesArray.map(cookie => {
            const parts = cookie.split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            return `${name}=${encodeURIComponent(value)}`;
        });

        const formattedHeaders = {
            Cookie: formattedCookies.join('; ')
        };


        const jsonString = JSON.stringify(formattedHeaders, null, 2);

        // Specify the file path where you want to save the JSON data
        const filePath = 'formattedCookies.json';

        // Write the JSON data to the file
        fs.writeFile(filePath, jsonString, 'utf-8', (err) => {
            if (err) {
                console.error('Error saving to file:', err);
            } else {
                console.log(`Formatted cookies and headers saved to ${filePath}`);
            }
        });
    } catch (error) {
        console.error('Error saving to file:', error);
    }
}

export {
    formatCookies
}