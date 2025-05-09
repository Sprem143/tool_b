const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {academy} = require('../controller/academy/academy')

router.post('/fetchurl', academy);


module.exports = router;
