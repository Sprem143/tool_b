const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    account:String,
    'Input UPC':String,
    'Vendor URL': String,
    ASIN: String,
    SKU: String,
    color:String,
    'Product price':Number,
    'Amazon link': String,
    'Image link': String,
    'Available Quantity': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    'Current Price':Number,
    'Current Quantity':String,
    'PriceRange':Array,
    'outofstock':String
}, {timestamps:true});

module.exports = mongoose.model('Backup', urlSchema);
