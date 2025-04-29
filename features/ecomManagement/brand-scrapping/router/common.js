const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {getfiltersheetforcheck, deleteproduct,editsku, editshippingcost, deletemanyproduct, setbulkshippingcost} = require('../controller/file')

router.post('/getfiltersheetforcheck', getfiltersheetforcheck);
router.delete('/deleteproduct', deleteproduct);
router.put('/editsku',editsku)
router.put('/editshippingcost',editshippingcost)
router.delete('/deletemanyproduct',deletemanyproduct)
router.put('/setbulkshippingcost',setbulkshippingcost)


module.exports = router;
