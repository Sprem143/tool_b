const mongoose= require('mongoose')

const brandProductUrlSchema = new mongoose.Schema({
   producturl:String,
   vendor:String,
   account:String,
   Date: {
      type: String,
      default: () => new Date().toLocaleString(),  
  }
});

module.exports= mongoose.model('ErrorUrl', brandProductUrlSchema);