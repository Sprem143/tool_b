const express = require('express')
const router = express.Router()
// const multer = require('multer');

// require('dotenv').config();
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'profile', 
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//   },
// });

// const parser = multer({ storage: storage });

const {login, sendotp, signup, getprofile} = require('./controller')

router.post('/login', login)
router.post('/sendotp', sendotp)
router.post('/signup', signup)
router.get('/getprofile', getprofile)

module.exports = router