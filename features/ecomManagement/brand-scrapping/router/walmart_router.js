const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {fetchurl,fetchurl2, currentdetails, downloadProductExcel, deleteoldurls, refreshdetails} = require('../controller/walmart/walmart')

router.post('/fetchurl', fetchurl);
router.post('/fetchurl2', fetchurl2);
router.post('/currentdetails', currentdetails);
router.post('/downloadProductExcel',downloadProductExcel)
router.post('/deleteoldurls',deleteoldurls)
router.post('/refreshdetails',refreshdetails)

module.exports = router;
