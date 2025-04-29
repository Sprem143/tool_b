
const mongoose = require('mongoose');

const productSchema=new mongoose.Schema({
        account:String,
       'Date ordered':String,
        Retailer:String,
        'Amazon Order id':String,
        'Vendor ID':String,
        'Description':String,
        'SKUs to match':String,
        'Vendor Tracking #':{
                type:String,
                default:''
        },
        ASINs:String,
        'Qty':String,
        "Qty Rec'd":String,
        'Date Received':String,
        'last date':String,
        'Qty Shipped':String,
        Shoes:String,
        'Date Shipped':String,
         status:{
                type:String,
                default:''
         },
        Notes:String,
        'Replacement Shoe Box':String,
        'Vendor Return':{
                type:String,
                default:undefined
        },
        'Return date':String,
        entryby:String,
        uploadedby:String,
        pdf:{
                default:'',
                type:String
        },
        'Row #': Number,
        'Condition':String,
        'Return Received date':String,
        'Return tracking id':String,
        'AZ id':String,
        'Old SKUs':String,
        'Product':String,
        'Return reason':String,
        'Returned QTy':String,
        'V Cost':String,
        'Assigned to new AZ id':String,
        'Vendor Return Tracking ids':String,
        Date: {
                type:String,
                default: new Date().toLocaleString()
        }
},{timestamps:true});

module.exports=mongoose.model('Product2', productSchema)