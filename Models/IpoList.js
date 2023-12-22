import mongoose from 'mongoose';

const IpoCompany = new mongoose.Schema({
    company_list: [],
    site_name: String,

});

const company = mongoose.model('companies', IpoCompany);

export { company };
