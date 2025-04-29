const mongoose = require('mongoose');

const employeeSchema=new mongoose.Schema({
    name:String,
    mobile:{
        type:Number,
    },
    email:{
        type:String,
    },
    password:String,
    status:{
        type:Boolean,
        default:true
    },
    account:{type:String},
    canedit:{
        type:String,
        default:false
    },
    role:{
        type:String,
    },
    sheet:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    },
    sheetlist: {
        type: [String],
        default: [] 
      },
    secretkey:{
        type:String,
        default:''
    },
    clientid:{
        type:String,
        default:''
    },
    addedby:String,
    img:{
        default:'',
        type:String
    },
    Date: {
        type:String,
        default: new Date().toLocaleString()
}
});

module.exports=mongoose.model('Employee2', employeeSchema)