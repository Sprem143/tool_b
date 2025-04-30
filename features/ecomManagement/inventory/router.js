const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {saveproduct, getproductlink, getinventorycard, downloadSyncedProduct,downloadBackup, alreadysavedproduct,deleteinventory, deletesynced, uploadinvfile, viewinventoryfile, viewsynceddata} = require('./controller/file')
const {thread1,thread2,thread3,thread4,thread5,thread6,thread7,thread8,thread9, thread10,thread11, thread12,thread13, thread14,thread15,thread16,thread17,thread18} = require('./controller/scrap')

router.post('/saveproduct',saveproduct)
router.post('/getproductlink',getproductlink)
router.post('/getinventorycard',getinventorycard)
router.post('/downloadSyncedProduct',downloadSyncedProduct)
router.get('/downloadBackup',downloadBackup)
router.post('/alreadysavedproduct',alreadysavedproduct)
router.post('/deleteinventory',deleteinventory)
router.post('/deletesynced',deletesynced)
router.post('/viewinventoryfile',viewinventoryfile)
router.post('/viewsynceddata',viewsynceddata)
router.post('/uploadinvfile',upload.single('file'),uploadinvfile)

router.post('/thread1', thread1)
router.post('/thread2', thread2)
router.post('/thread3', thread3)
router.post('/thread4', thread4)
router.post('/thread5', thread5)
router.post('/thread6', thread6)
router.post('/thread7', thread7)
router.post('/thread8', thread8)
router.post('/thread9', thread9)
router.post('/thread10', thread10)
router.post('/thread11', thread11)
router.post('/thread12', thread12)
router.post('/thread13', thread13)
router.post('/thread14', thread14)
router.post('/thread15', thread15)
router.post('/thread16', thread16)
router.post('/thread17', thread17)
router.post('/thread18', thread18)


module.exports = router;
