const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
   name:String,
   email:String,
   account:String,
   vendor:String,
   brandname:String,
   brandurl:String,
   urls:Number,
   products:Number,
   finalproducts:Number,
   Date: {
    type: String,
    default: () => new Date().toLocaleString(),  
},});

module.exports = mongoose.model('Scrappedbrand', dataSchema);