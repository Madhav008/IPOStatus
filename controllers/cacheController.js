import { logger } from "../logger.js";
import { CachePan } from "../Models/CacheModel.js";

async function checkIfCached(pan, company) {
    try {
        const pandata = await CachePan.findOne({
            pan: pan,
            company_Name: company
        });

        if (pandata) {
            return { isPandata: true, pandata };
        } else {
            return { isPandata: false, pandata: null };
        }
    } catch (error) {
        logger.error({ message: error.message });
        return { isPandata: false, pandata: null };
    }
}

async function cacheData(pan, company_Name, data) {
    try {
        const newData = new CachePan({
            pan: pan,
            company_Name: company_Name,
            result: JSON.stringify(data)
        });

        await newData.save();

        logger.info({ message: `${pan} Cached Successfully` });
        return newData;
    } catch (error) {
        logger.error({ message: error.message });
        return null;
    }
}

export { checkIfCached, cacheData };

