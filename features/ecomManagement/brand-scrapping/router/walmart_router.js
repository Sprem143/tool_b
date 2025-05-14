const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {fetchurl, currentdetails} = require('../controller/walmart/walmart')

router.post('/fetchurl', fetchurl);
router.post('/currentdetails', currentdetails);


module.exports = router;
