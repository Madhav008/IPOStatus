import mongoose from 'mongoose';

const CachePanSchema = new mongoose.Schema({
    company_Name: String,
    pan: String,
    result: String
})
const CachePan = mongoose.model('CachePan', CachePanSchema);

export { CachePan };