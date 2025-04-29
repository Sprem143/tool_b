const express = require('express')
const router = express.Router()

const {scrapeNames, downloadExcel} = require('./controller')

router.post('/scrapeNames',scrapeNames)
router.get('/downloadExcel',downloadExcel)

module.exports = router