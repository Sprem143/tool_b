const express = require('express')
const router = express.Router()

const {login, sendotp, signup, getprofile} = require('./controller')

router.post('/login', login)
router.post('/sendotp', sendotp)
router.post('/signup', signup)
router.get('/getprofile', getprofile)
module.exports = router