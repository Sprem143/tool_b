const mongoose = require('mongoose');


const employeeSchema=new mongoose.Schema({
    name:String,
    mobile:{
        type:Number,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    password:String,
    status:{
        type:Boolean,
        default:true
    },
    addedby:String,
    role:{
        type:String,
        default:'prepemployee'
    },
    canedit:{
        type:String,
        default:false
    },
    account:{type:String},
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