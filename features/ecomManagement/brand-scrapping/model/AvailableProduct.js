const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    account:String,
    UPC: String,
    ASIN: String,
    'Amazon link': String,
    'UPC List': String,
    Title: String,
    Brand: String,
    'Image link': String,
    'Number of Sellers': String,
    'Product Category': String,
});

module.exports = mongoose.model('AvailableProduct', dataSchema);