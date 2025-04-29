const express = require('express')
const router = express.Router()

const {login, sendotp, signup, getprofile,addsecretkey,addsheetdetails,addclientid} = require('./controller')

router.post('/login', login)
router.post('/sendotp', sendotp)
router.post('/signup', signup)
router.post('/addsecretkey', addsecretkey)
router.post('/addsheetdetails', addsheetdetails)
router.post('/addclientid', addclientid)
router.get('/getprofile', getprofile)
module.exports = router