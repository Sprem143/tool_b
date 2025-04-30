const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    vendor:{
        type:String,
        lowercase: true
    },
    account:String,
    'Input UPC':String,
    ASIN: String,
    SKU: String,
    'Product price': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    'Brand Name':String,
    'Amazon Title':String
});
module.exports = mongoose.model('InvProduct', dataSchema);