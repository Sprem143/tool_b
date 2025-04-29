
  const mongoose = require('mongoose');
  
  const employeeSchema=new mongoose.Schema({
    name: String,
    meaning: String,
    religion: String,
    gender: String,
    number: String,
  });
  
  module.exports=mongoose.model('BabyName', employeeSchema)