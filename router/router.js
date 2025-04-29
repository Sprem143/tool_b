const express = require('express')
const router = express()

const omEmployeeRouter = require('../features/orderManagement/employee/router');
const omDataRouter = require('../features/orderManagement/data/router')
const AdminRouter = require('../features/orderManagement/admin/router')
const CloudinaryRouter = require('../cloudinary/router')
const GoogleRouter = require('../google-sheet/rcube/router')
const BelkRouter = require('../features/ecomManagement/brand-scrapping/router/belk_router')
const BoscovRouter = require('../features/ecomManagement/brand-scrapping/router/boscov_router')
const Brand_common_router = require('../features/ecomManagement/brand-scrapping/router/common')
const Inventory_router = require('../features/ecomManagement/inventory/router')
const Name_Router = require('../namescrap/router')


router.use('/om/employee',omEmployeeRouter);
router.use('/om/data',omDataRouter)
router.use('/om/admin',AdminRouter)
router.use('/upload',CloudinaryRouter)
router.use('/api/google', GoogleRouter)
router.use('/scrap/belk', BelkRouter)
router.use('/scrap/boscovs', BoscovRouter)
router.use('/brand',Brand_common_router)
router.use('/inv',Inventory_router)
router.use('/name', Name_Router)

module.exports= router