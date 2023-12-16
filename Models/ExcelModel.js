import mongoose from 'mongoose';

const Excel = new mongoose.Schema({
    Company_Name: String,
    ASBASRL: String,
    BNKCODE: String,
    APPLNO: String,
    TMNAME: String,
    PANGIR1: String,
    DPCLITID: String,
    ORDER_NO: String,
    BOOK_ID: String,
    BRANCH: String,
    USR_ID: String,
    SHARES: String,
    AMOUNT: String,
    ALLOT: String,
    NAME1: String,
    REASON: String,
})
const excel = mongoose.model('excel', Excel);

export { excel };