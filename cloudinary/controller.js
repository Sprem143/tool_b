const cloudinary = require('cloudinary').v2;
const Product2 = require('../features/orderManagement/data/model')

exports.uploadprofilepic= async(req, res)=>{
    try{
        console.log('upload')
      if(req.file.path){
        res.status(200).json({status:true, img: req.file.path });
      }else{
        res.stutus(404).json({status:false, msg:"Url Not found"})
      }
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}

exports.getpdflink = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const pdfurl = req.file.path;
        pdfurl ? res.status(200).json({ status: 200, pdfurl: pdfurl }) : res.status(404).json({ status: false, msg: 'Error while uploading pdf' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.updatepdflink = async (req, res) => {
    try {
        const { id, uploadedby } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const pdfurl = req.file.path;
        let entry = await Product2.findById({ _id: id })
        if (entry) {
            if (entry.pdf !== '') {
                let match = entry.pdf.match(/\/(pdfs\/[^/]+\.pdf)$/);
                match = match[1]
                await cloudinary.uploader.destroy(match, { resource_type: "raw" });
            }
            let product = await Product2.findByIdAndUpdate(
                { _id: id },
                { $set: { pdf: pdfurl, uploadedby: uploadedby } },
                { new: true }
            );
            product ? res.status(200).json({ status: true, msg: "Pdf link updated successfully" }) : res.status(500).json({ status: false, msg: "Product found but error while updating" })
        } else {
            res.status(404).json({ status: false, msg: "Product not found" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}