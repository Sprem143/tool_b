const BrandUrl = require('../../model/brandurl')
const { JSDOM } = require("jsdom");
const Product = require('../../model/products')
const Scrappedbrand = require('../../model/scrappedbrand')
require('dotenv').config();
const apikey = process.env.API_KEY
const { ZenRows } = require("zenrows");
const axios = require('axios');
const cheerio = require('cheerio')
const {checkifbrandalreadyscrap}= require('../../controller/belk/util');
const FinalProduct = require('../../model/finalProduct');

function extractProductUrls(html) {
    // Parse HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const productLinks = document.querySelectorAll('.mz-productlisting-image a');
    return Array.from(productLinks).map(link => link.getAttribute('href'));
}

exports.fetchurl = async (req, res) => {
    try {
        const html = req.body.html;
        const profile = req.body.profile
        const account = profile.account;
        let result = extractProductUrls(html)
        if (Array.isArray(result) && result.length > 0) {
            let producturl = result.map((r) => 'https://www.boscovs.com' + r);
            let prev = await BrandUrl.find({ account: account });
            if (prev.length > 0) {
                let prevarr = prev[0].producturl;
                producturl.push(prevarr)
                let newarr = producturl.flat()
                let updatedarr = await BrandUrl.findByIdAndUpdate(
                    { _id: prev[0]._id },
                    { $set: { producturl: newarr } },
                    { new: true }
                )
                res.status(200).json({ status: true, url: updatedarr.producturl })
            } else {
                console.log( producturl[0])
                let brandname = producturl[0].split('/')[4].split('-')
                brandname = brandname[0] == 'plus' ? brandname[2] : brandname[1]
                console.log(brandname)
                let isexisting = await checkifbrandalreadyscrap(brandname,'boscovs')

                console.log(isexisting)
                if (isexisting) {
                    let matched = await Scrappedbrand.findOne({ brandurl: isexisting });
                    if (!matched) {
                        matched = await Scrappedbrand.findOne({ brandname: brandname })
                    }
                    return res.json({ status: 'exist', data: matched })
                } else {
                    let data = new Scrappedbrand({ name: profile.name, email: profile.email, brandname: brandname, brandurl:producturl[0], vendor: 'boscovs' })
                    let saved = await data.save();
                    console.log(saved)
                    let newurllist = new BrandUrl({ producturl: producturl, account: account, brand: 'boscovs' })
                    let resp = await newurllist.save();
                    res.status(200).json({ status: true, url: resp.producturl })
                }
            }
        } else {
            res.status(404).json({ status: false, msg: 'No url found' })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deleteoldurls = async (req, res) => {
    try {
        const account = req.body.account
        let urls = await BrandUrl.deleteMany({ account: account });
        let products = await Product.deleteMany({ account: account })
        await FinalProduct.deleteMany()

        res.status(200).json({ status: true, urls: urls.deletedCount, products: products.deletedCount })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.currentdetails = async (req, res) => {
    try {
        const account = req.body.account
        let totalurl = await BrandUrl.findOne({ account: account})
        let totalurlnum = totalurl?.producturl.length || 0
        let fetchedproduct = await Product.countDocuments({ account: account })
        console.log(fetchedproduct, totalurlnum)
        if (totalurl) {
            res.status(200).json({ status: true, url: totalurlnum, fetched: fetchedproduct, link: totalurl.producturl })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}



