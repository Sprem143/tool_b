const mongoose = require('mongoose');


const employeeSchema=new mongoose.Schema({
    name:String,
    mobile:{
        type:Number,
        unique:true
    },
    role:{
        type:String,
        default:'admin'
    },
    email:{
        type:String,
        unique:true
    },
    password:String,
    img:{
        default:'',
        type:String
    },
    Date: {
        type:String,
        default: new Date().toLocaleString()
}
});

module.exports=mongoose.model('Admin', employeeSchema)