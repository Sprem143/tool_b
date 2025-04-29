const Product2 = require('./model')




exports.deleteentry = async (req, res) => {
    try {
        let id = req.body.id;
        let resp = await Product2.deleteOne({ _id: id })
        resp.acknowledged && res.status(200).json({ status: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}
exports.getcarddetails = async (req, res) => {
    try {
        let account = req.body.account;
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);
        let todayproduct = await Product2.find({
            account: account,
            createdAt: { $gte: sd, $lte: ed },
        });
        let untrackable = await Product2.countDocuments({ account: account, 'Vendor Tracking #': '' })
        let nopdf = await Product2.countDocuments({ account: account, pdf: { $eq: "" } })
        let unshipped = await Product2.countDocuments({ account: account, 'Vendor Tracking #': { $ne: '' }, 'pdf': { $ne: '' }, 'Date Shipped': '' });
        let returnproduct = await Product2.countDocuments({ account: account, 'Vendor Return': { $type: "string" } });

        let lastDate = new Date().toISOString().slice(0, 10)
        let deadline = await Product2.countDocuments({ 'last date': lastDate, status: '' })

        let data = [
            { id: 1, title: "Today's Entry", description: todayproduct.length, img: "/static/todayentry.png", sub: 'Current day entry' },
            { id: 2, title: "Untrackable", description: untrackable, img: "/static/untrackable.png", sub: 'Update tracking id' },
            { id: 3, title: "PDF Require", description: nopdf, img: "/static/pdf.png", sub: 'Upload pdf' },
            { id: 4, title: "Unshipped", description: unshipped, img: "/static/unshipped.png", sub: 'Prep center use' },
            { id: 5, title: "Return", description: returnproduct, img: "/static/return.png", sub: 'Return product' },
            { id: 6, title: "Deadline", description: deadline, img: "/static/deadline.png", sub: 'Urgent action needed' },
        ]
        res.status(200).json({ status: true, data: data, todayEntry: todayproduct })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.getadmincarddetails = async (req, res) => {
    try {
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);
        let todayproduct = await Product2.find({
            createdAt: { $gte: sd, $lte: ed },
        });
        let untrackable = await Product2.countDocuments({ 'Vendor Tracking #': { $ne: "" } })
        let nopdf = await Product2.countDocuments({ pdf: { $eq: "" } })
        let unshipped = await Product2.countDocuments({ 'Vendor Tracking #': '' });
        let returnproduct = await Product2.countDocuments({ 'Vendor Return': { $ne: "" } });
        let lastDate = new Date().toISOString().slice(0, 10)
        let deadline = await Product2.countDocuments({ 'last date': lastDate, status: '' })
        let data = [
            { id: 1, title: "Today's Entry", description: todayproduct.length, img: "/static/todayentry.png", sub: 'Current day entry' },
            { id: 2, title: "Untrackable", description: untrackable, img: "/static/untrackable.png", sub: 'Update tracking id' },
            { id: 3, title: "PDF Require", description: nopdf, img: "/static/pdf.png", sub: 'Upload pdf' },
            { id: 4, title: "Unshipped", description: unshipped, img: "/static/unshipped.png", sub: 'Prep center use' },
            { id: 5, title: "Return", description: returnproduct, img: "/static/return.png", sub: 'Return product' },
            { id: 6, title: "Deadline", description: deadline, img: "/static/deadline.png", sub: 'Urgent action needed' },
        ]
        res.status(200).json({ status: true, data: data, todayentry: todayproduct })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.getprepcentercard = async (req, res) => {
    try {
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);
        let todayproduct = await Product2.find({
            status: { $in: ['shipped', 'return'] },
            createdAt: { $gte: sd, $lte: ed },
        });
        let unshipped = await Product2.countDocuments({ 'Vendor Tracking #': { $ne: '' }, pdf: { $ne: '' }, status: '' });
        let returnproduct = await Product2.countDocuments({ 'Vendor Return': { $ne: "" } });
        let lastDate = new Date().toISOString().slice(0, 10)
        let deadline = await Product2.countDocuments({ 'last date': lastDate, status: '' })
        let data = [
            { id: 1, title: "Shipped Today", description: todayproduct.length, img: "/static/todayentry.png", sub: 'Current day Shipment' },
            { id: 2, title: "Unshipped", description: unshipped, img: "/static/unshipped.png", sub: 'Prep center use' },
            { id: 3, title: "Return", description: returnproduct, img: "/static/return.png", sub: 'Return product' },
            { id: 4, title: "Deadline", description: deadline, img: "/static/deadline.png", sub: 'Urgent action needed' },
        ]
        res.status(200).json({ status: true, data: data, todayentry: todayproduct })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.search = async (req, res) => {
    try {
        let { key, searchby } = req.body;

        if (!key || !searchby) {
            return res.status(400).json({ status: false, msg: "Missing search key or field" });
        }
        let query = { [searchby]: key };
        let result = await Product2.find(query);
            res.status(200).json({ status: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

exports.untrackable = async (req, res) => {
    try {
        const { account } = req.body
        let data = await Product2.find({ account: account, 'Vendor Tracking #': '' })
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}

exports.pdfrequire = async (req, res) => {
    try {
        const { account } = req.body
        let data = await Product2.find({ account: account, 'pdf': '' })
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deadline = async (req, res) => {
    try {
        const { account } = req.body;
        let lastDate = new Date().toISOString().slice(0, 10)
        let data;
        if (!account) {
            data = await Product2.find({ 'last date': lastDate, status: '' })
        } else {
            data = await Product2.find({account:account, 'last date': lastDate, status: '' })       
        }
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}

exports.returned = async (req, res) => {
    try {
        const { account } = req.body;
        let data;
        if (!account) {
            data = await Product2.find({'Vendor Return':{$ne:''} })
        } else {
            data = await Product2.find({account:account, 'Vendor Return': { $type: "string" }})       
        }
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}

exports.updatetrackingid = async (req, res) => {
    try {
        const { id, trackingid } = req.body;
        let resp = await Product2.findByIdAndUpdate(
            { _id: id },
            { $set: { 'Vendor Tracking #': trackingid } },
            { new: true }
        )
        if (resp['Vendor Tracking #']) {
            res.status(200).json({ status: true, asin: resp.ASINs })
        } else {
            res.status(404).json({ status: 'false', msg: 'Error while updating' })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.unshipped = async (req, res) => {
    try {
        const { account } = req.body;
        let data;
        if (!account) {
            data = await Product2.find({ 'Vendor Tracking #': { $ne: '' }, 'pdf': { $ne: '' }, status: '' })
        } else {
            data = await Product2.find({ account: account, 'Vendor Tracking #': { $ne: '' }, 'pdf': { $ne: '' }, status: '' })
        }
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}

exports.todayentry = async (req, res) => {
    try {
        const { account } = req.body;
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);
        let data;
        if (!account) {
            data = await Product2.find({
                createdAt: { $gte: sd, $lte: ed },
            });
        } else {
            data = await Product2.find({
                createdAt: { $gte: sd, $lte: ed },
                account:account
            });
        }
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' })
        }
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}


exports.datewise = async (req, res) => {
    try {
       let startDate = req.body.startDate
       let endDate = req.body.endDate

       const account = req.body.account
      
       const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const query = {
      createdAt: { $gte: start, $lte: end },
    };

    if (account) {
      query.account = account;
    }

    const data = await Product2.find(query);
            res.status(200).json({ status: true, data: data })
       
    } catch (err) {
        res.status(500).json({ status: false, msg: err })
    }
}
// ------change status for prep center user
exports.changestatus = async (req, res) => {
    try {
        const { id, status } = req.body
        let date = new Date().toLocaleString()
        let updated = await Product2.findByIdAndUpdate(
            { _id: id },
            { $set: { status: status, 'Date Shipped': date } },
            { new: true }
        )
        if (updated) {
            res.status(200).json({ status: true, asin: updated.ASINs, order: updated })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.getsavedentry = async(req,res)=>{
    try{
       let account = req.body.account
       let data = await Product2.find({account:account})
       res.status(200).json({status:true, data:data})
    }catch(err){
        console.log(err)
        res.status(500).json({status:false, msg:err})
    }
}


exports.addproduct = async (req, res) => {
    try {
        const product = req.body.product;
        const employeeid = req.body.id;
        const editid = req.body.editid;
        let account;
        if (product['SKUs to match']) {
            let sku = product['SKUs to match'].trim().toUpperCase()
            sku.startsWith('RC') ? account = 'rcube' : sku.startsWith('BJ') ? account = 'bijak' : sku.startsWith('ZL') ? account = 'zenith' : sku.startsWith('OM') ? account = 'om' : null
        }
        if (!account) {
            return res.status(404).json({ status: 'invalid', msg: 'Please check sku. That should start with only- RC/ZL/OM/BJ' })
        }
        if (editid !== '') {
            await Product2.findOneAndDelete({ _id: editid });
        }
        const data = { ...product, entryby: employeeid, account: account };
        const newProduct = new Product2(data);
        const savedProduct = await newProduct.save();
        if (savedProduct) {
            return res.status(200).json({ status: true, data: savedProduct, msg: 'Product details added successfully' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            msg: err
        });
    }
};
exports.savenewdata = async(req,res)=>{
    try{
        let data = req.body.data
        let name = req.body.name
        let account;
        if (data.length>0 && data[0]['SKUs to match']) {
            let sku = data[0]['SKUs to match'].trim().toUpperCase()
            sku.startsWith('RC') ? account = 'rcube' : sku.startsWith('BJ') ? account = 'bijak' : sku.startsWith('ZL') ? account = 'zenith' : sku.startsWith('OM') ? account = 'om' : null
        }
        if (!account) {
            return res.status(404).json({ status: 'invalid', msg: 'Please check sku. That should start with only- RC/ZL/OM/BJ' })
        }
        let count =0;
        let existingCount =0
      for(let i of data){
         i = { ...i, entryby: name, account: account };
        let ifexist = await Product2.find({'Amazon Order id':i['Amazon Order id']})
        if(ifexist.length>0){
          ifexist= ifexist.map((e)=> e['Row #'])
            if(!ifexist.includes(Number(i['Row #']))){
                let newEntry = new Product2(i)
                await newEntry.save();
                count+=1;
            }else{
                existingCount+=1
            }
        }else{
           let newEntry = new Product2(i)
           await newEntry.save();
           count+=1;
        }
      }
     if(count>0 ){

        res.status(200).json({status:true, count:count, existingCount:existingCount})
     }  else{

        res.status(404).json({status:false, msg:'No new Data found or saved'})
     }
    
        
    }catch(err){
        console.log(err)
        res.status(500).json({status:false, msg:err})
    }
}




