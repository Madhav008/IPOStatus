import { logger } from '../logger.js';
import puppeteer from 'puppeteer'


const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const IPOList = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();

  try {
    // Navigate to the website
    await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');
    // Wait for the page to load
    await page.waitForSelector('#ddlCompany');
    // Extract uncommented options from the select element
    const options = await page.evaluate(() => {
      const selectElement = document.querySelector('#ddlCompany');
      const optionElements = selectElement.querySelectorAll('option:not(:disabled)'); // Select only uncommented options
      const optionValues = Array.from(optionElements).map(option => option.textContent.trim() + "--" + option.value);
      return optionValues;
    });

    return options;
  } catch (error) {
    console.error('Error:', error);
    logger.error({ message: 'Error in IPOList: ' + error });

  } finally {
    await browser.close();
  }
};


const bigshare = async (panList, company_id) => {
  // const ipoList = await IPOList();

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new"
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://ipo.bigshareonline.com/IPO_Status.html');
    await page.waitForSelector('#ddlCompany');

    const ipoStatusList = [];
    const failedPans = [];

    const retryBigshare = async (PAN) => {
      try {
        await page.select('#ddlCompany', company_id);
        await page.waitForSelector('#txtpan');
        await page.select('#ddlSelectionType', 'PN');
        await page.type('#txtpan', `${PAN}`);
        const sessionData = await page.evaluate(() => sessionStorage.getItem('captchaCode'));
        const captchadata = JSON.parse(sessionData);

        // Check if captchadata is present
        if (captchadata) {
          await sleep(100);
          await page.type('#captcha-input', captchadata + '');
          await page.click('#btnSearch');
          await page.waitForSelector('#dPrint');
          await sleep(200);

          const data = await page.evaluate(() => {
            const tableRows = document.querySelectorAll('#dPrint table tbody tr');
            const rowData = {};

            tableRows.forEach((row) => {
              const th = row.querySelector('th');
              const td = row.querySelector('td');

              if (th && td) {
                const key = th.textContent.trim();
                const value = td.textContent.trim();
                rowData[key] = value;
              }
            });

            return rowData;
          });

          await page.click('#btnclear');
          await page.reload();
          await sleep(100);

          // Remove PAN from failedPans after successful retry
          const index = failedPans.indexOf(PAN);
          if (index !== -1) {
            failedPans.splice(index, 1);
          }

          return data;
        } else {
          console.error(`Captcha data not available for PAN ${PAN}. Adding to failedPans.`);
          logger.error({ message: `Captcha data not available for PAN ${PAN}. Adding to failedPans.` });

          failedPans.push(PAN);
          return null;
        }
      } catch (error) {
        console.error(`Failed to retrieve data for PAN ${PAN} even after retry.`);
        logger.error({ message: `Failed to retrieve data for PAN ${PAN} even after retry.`+ error });

        return null;
      }
    };

    for (const PAN of panList) {
      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          const data = await retryBigshare(PAN);

          if (data) {

            var finaldata = {
              PAN: PAN,
              ...data
            }
            console.log(`Data for PAN ${PAN}:`, JSON.stringify(finaldata, null, 2));
            logger.info({ message: `Data for PAN ${PAN}:`, finaldata });

            ipoStatusList.push(finaldata);
            success = true;
          } else {
            console.error(`Failed attempt for PAN ${PAN}. Retrying...`);
            logger.error({ message: `Failed attempt for PAN ${PAN}. Retrying...` });

            retries--;
            await sleep(1000);
            await page.reload()
          }
        } catch (error) {
          console.error(`Error processing PAN ${PAN}:`, error);
          logger.error({ message: `Error processing PAN ${PAN}:`+ error });

        }
      }

      if (!success) {
        console.error(`Failed to retrieve data for PAN ${PAN} after retries.`);
        logger.error({ message: `Failed to retrieve data for PAN ${PAN} after retries.` });

        failedPans.push(PAN);
      }
    }

    // Retry failed PANs
    for (const failedPAN of failedPans) {
      const data = await retryBigshare(failedPAN);
      if (data) {
        console.log(`Data for PAN ${failedPAN} (after retry):`, JSON.stringify(data, null, 2));
        logger.info({ message: `Data for PAN ${failedPAN} (after retry):`, data });

        ipoStatusList.push(data);
      }
    }

    return { ipoStatusList, failedPans };
  } catch (error) {
    console.error('Error:', error);
    logger.error({ message: 'Error in bigshare:'+ error });

  } finally {
    await browser.close();
  }
};
export { bigshare, IPOList };
