const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    account:String,
    isCheked:{
        type:Boolean,
        default:false
    },
    SKU: String,
    ASIN:String,
    'Amazon link': String,
    'Belk link': String,
    Title:String,
    belkTitle:String,
    Brand:String,
    UPC:String,
    'Fulfillment Shipping':String,
    'Available Quantity': Number,
    'Product name': String,
    'Img link': String,
    'Product price': Number,
    Size:String,
    Color: String,
});

module.exports = mongoose.model('FinalProduct', dataSchema);