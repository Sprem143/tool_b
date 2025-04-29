const express= require('express')
const router= express.Router();

const {callback, auth, sheet, verifytoken} = require('./controller')

router.post('/auth', auth)
router.get('/callback', callback)
router.post('/sheet',sheet)

module.exports=router;
