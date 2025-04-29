
const mongoose= require('mongoose')

const backupproduct = new mongoose.Schema({
    email:String,
    account:String,
    upc: String,
    price: Number,
    pricerange:Array,
    quantity: Number,
    color: String,
    size: String,
    sku:String,
    imgurl: String,
    url: String,
});

module.exports= mongoose.model('ProductBackup', backupproduct);