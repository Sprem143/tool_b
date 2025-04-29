const Product = require('../model/products')
const FinalProduct = require('../model/finalProduct')
const xlsx = require('xlsx')
const {calculateshippingcost} = require('./belk/util')
exports.downloadProductExcel = async (req, res) => {
    try {
        const account = req.body.account;
        let productlist = await Product.find({ account: account });
        // let rc = await Rcube.find({}, { 'Input UPC': 1, _id: 0 })
        // rc = rc.map((r) => r['Input UPC'])

        // let zl = await Zenith.find({}, { 'Input UPC': 1, _id: 0 })
        // zl = zl.map((r) => r['Input UPC'])

        // let om = await Om.find({}, { 'Input UPC': 1, _id: 0 })
        // om = om.map((r) => r['Input UPC'])

        // let bj = await Bijak.find({}, { 'Input UPC': 1, _id: 0 })
        // bj = bj.map((r) => r['Input UPC'])
        // let count = 0
        // for (let p of productlist) {
        //     if (rc.includes(`UPC${p.upc}`) || zl.includes(`UPC${p.upc}`) || om.includes(`UPC${p.upc}`) || bj.includes(`UPC${p.upc}`)) {
        //         await Product.findOneAndDelete({ upc: p.upc });
        //         count += 1;
        //     }
        // }
        const products = await Product.find({ account: account });
        if (productlist.length > 0) {
            // res.status(200).json({ status: true, data: products, count: count })
            res.status(200).json({ status: true, data: products })
        } else {
            res.status(404).json({ status: true, msg: "No data found" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.uploadforcheck = async (req, res) => {
    try {
        const account = req.body.account;
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        await FinalProduct.deleteMany();
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[4];
        const sheet = workbook.Sheets[sheetName];
        let data = xlsx.utils.sheet_to_json(sheet);
        data = data.slice(5)
        data = data.filter(row => row['__EMPTY_2'] == 'Add Product');
        let result = []
        for (let d of data) {
            let keys = Object.keys(d)
            result.push({ upc: d[keys[0]], ASIN: d[keys[5]], Title: d[keys[2]] })
        }

        let finalsheet = []
        for (let r of result) {
            if (r && r.upc) {
                let product = await Product.findOne({ upc: r.upc })
                if (product) {
                   let newProduct = {
                    UPC:r.upc,
                    ASIN:r.ASIN,
                    Title: r.Title,
                    account:account,
                    SKU: product?.sku || '',
                    'Belk link': product?.url,
                    Brand:product?.Brand|| '',
                    'Fulfillment Shipping':calculateshippingcost(r.Title) || 0,
                    'Available Quantity': product?.quantity,
                    'Img link': product?.imgurl,
                    'Product price': Number(Number(product?.price).toFixed(1)),
                    Size:product?.size,
                    Color: product?.color,
                    belkTitle:product?.belkTitle ||'',
                    'Amazon link': `https://www.amazon.com/dp/${r.ASIN}`,
                   }
                   finalsheet.push(newProduct)
                }
            }
        }
            await FinalProduct.deleteMany({account:account})
            let resp = await FinalProduct.insertMany(finalsheet)
            res.status(200).json({status:true, data:resp})

    } catch (err) {
        console.log(err);
        res.send(err);
    }
};

// ---------brand search result------
exports.getfiltersheetforcheck = async (req, res) => {
    try {
        const account = req.body.account;
        let data = await FinalProduct.find({account:account});
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: false, msg: "Server error" })
        }
    } catch (err) {
        console.error('Error generating Excel sheet:', err);
        res.status(500).send('An error occurred while generating the Excel file.');
    }
};

exports.deleteproduct = async (req, res) => {
    try {
        const { id } = req.body
        console.log(id)
        let resp = await FinalProduct.deleteOne({ _id: id });
        if (resp.deletedCount == 1) {
            res.status(200).json({ status: true, count:resp.deletedCount })
        }
    } catch (err) {
        res.status(500).json({ staus: false, msg: 'err' })
        console.log(err)
    }
}

exports.editsku = async (req, res) => {
    try {
        const id = req.body.id
        const newsku = req.body.newsku
        let resp = await FinalProduct.findOneAndUpdate(
            { _id: id },
            { $set: { SKU: newsku } },
            { new: true }
        )
        res.status(200).json({ status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.editshippingcost = async (req, res) => {
    try {
        const { id, value } = req.body

        await FinalProduct.findOneAndUpdate(
            { _id: id },
            { $set: { 'Fulfillment Shipping': value } },
            { new: true }
        )
        res.status(200).json({ status: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.setbulkshippingcost = async (req, res) => {
    try {
        const { idarr, shippingcost } = req.body;
        let resp = await FinalProduct.updateMany(
            { ASIN: { $in: idarr } },
            { $set: { 'Fulfillment Shipping': shippingcost } }
        )
        res.status(200).json({ status: true, count: resp.modifiedCount })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deletemanyproduct = async (req, res) => {
    try {
        let asins = req.body.arr;
        const account = req.body.account
        if (!Array.isArray(asins) || asins.length === 0) {
            return res.status(400).json({ message: "Invalid or empty ASIN array" });
        }
        let resp = await FinalProduct.deleteMany({ ASIN: { $in: asins } })
        let newdata = await FinalProduct.find({account:account})
        res.status(200).json({ status: true, count: resp.deletedCount, data:newdata })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}