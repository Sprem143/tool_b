const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {rotatePdfs} = require('./controller')

router.post('/rotate-pdfs',upload.array('pdfs'),rotatePdfs )

module.exports = router;
