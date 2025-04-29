const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Unified storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.body.folder || 'default'; 
    const ext = path.extname(file.originalname).toLowerCase();
    let resource_type = 'image';
    if (ext === '.pdf') resource_type = 'raw';

    return {
      folder,
      format: ext.replace('.', ''),
      resource_type,
      public_id: `${Date.now()}_${path.parse(file.originalname).name}`, 
    };
  },
});

const upload = multer({ storage });


const {getpdflink, updatepdflink, uploadprofilepic} = require('./controller')

router.post('/getpdflink', upload.single('pdf'), getpdflink);
router.post('/updatepdflink',upload.single('pdf'), updatepdflink);
router.post('/uploadprofilepic', upload.single('file'),uploadprofilepic)
module.exports=router;
