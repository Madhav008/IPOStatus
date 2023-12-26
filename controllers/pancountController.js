import { User } from "../Models/userModel.js"
import { logger } from "../logger.js";


async function updateUserCount(userid) {
    try {
        let defaultCount = 100;
        let user = await User.findById(userid)

        let lastdayCount = user.count;

        let totalCount = user.total_count;

        totalCount = totalCount - (defaultCount - lastdayCount);

        if (user) {
            user.count = defaultCount;
            user.total_count = totalCount;
            const updatedUser = await user.save();
            logger.info({ message: updatedUser })
        }
    } catch (error) {
        logger.error({ message: error })
    }
}


async function getAllUser() {
    try {

        const users = await User.find()
        return users
    } catch (error) {
        logger.error({ message: error })
    }
}



export {
    updateUserCount, getAllUser

}



/* 
day 1 
daily 100 - 10 
total 500

day 2
daily 100 
tatal 410 = 500 - (100- lastday=10)


*/