const mongoose= require('mongoose')

const brandUrlSchema = new mongoose.Schema({
   url:{
    type: [String],
   },
   email:String,
   account:String

},{timestamps:true});

module.exports= mongoose.model('BrandPage', brandUrlSchema);