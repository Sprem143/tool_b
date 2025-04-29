const mongoose = require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    account:String,
    'Input UPC':String,
    'Vendor URL': String,
    ASIN: String,
    SKU: String,
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
    'Current Quantity':Number,
    'PriceRange':Array,
    'outofstock':String,
    remark:String,
    Brand:String,
    Date: {
        type:String,
        default: new Date().toLocaleString()
}
});

module.exports = mongoose.model('AutoFetchData', autofetchdataSchema);