const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {fetchurl, deleteoldurls, currentdetails} = require('../controller/boscov/extract')

router.post('/fetchurl', fetchurl);
router.post('/deleteoldurls',deleteoldurls)
router.post('/currentdetails',currentdetails)

module.exports = router;
