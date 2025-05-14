
require('dotenv').config();
const apikey = process.env.API_KEY
const BrandPage = require('../../model/brandpage');
const BrandUrl = require('../../model/brandurl');
const axios = require('axios');
const cheerio = require('cheerio')
const Product = require('../../model/products');
const finalProduct = require('../../model/finalProduct');
const Scrappedbrand = require('../../model/scrappedbrand')
const ProductBackup = require('../../model/productBackup')
const xlsx = require('xlsx')
const { JSDOM } = require("jsdom");

const { checkifbrandalreadyscrap, generateurl, insertInChunks, scrapfirstpage, handleSecondPageScraping } = require('./util');


exports.fetchbrand = async (req, res) => {
    try {
        const { url, num, brandname, profile } = req.body;
        let account = profile.account
        if (!account) {
            return res.status(404).json({ status: false, msg: "Account details not found. Please relogin and try again" })
        }
        let isexisting = await checkifbrandalreadyscrap(brandname, 'belk')
        if (isexisting) {
            let matched = await Scrappedbrand.findOne({ brandurl: isexisting });
            if (!matched) {
                matched = await Scrappedbrand.findOne({ brandname: brandname })
            }
            return res.status(200).json({ status: 'exist', data: matched })
        } else {
            let scrappedproducts = await Product.find({ account: account })
            await ProductBackup.deleteMany({ account: account })
            await insertInChunks('ProductBackup', scrappedproducts)

            await Promise.all([
                BrandPage.deleteMany({ account: account }),
                BrandUrl.deleteMany({ account: account, vendor:'belk' }),
                Product.deleteMany({ account: account })
            ])

            if (num > 60) { await generateurl(num, url, account) }

            let productUrls = await scrapfirstpage(url)
            if (productUrls.length > 0) {
                const productarr = productUrls.map(p => 'https://www.belk.com' + p);
                const products = new BrandUrl({ producturl: productarr, account: account, vendor: 'belk' });
                await products.save();
                if (num <= 60) {
                    let count = await BrandUrl.find({vendor:'belk'})
                    count = count[0]?.producturl.length
                    let data = new Scrappedbrand({ name: profile.name, email: profile.email, brandname: brandname, brandurl: url, urls: count,vendor:'belk' })
                    await data.save();
                    let links = await BrandUrl.findOne({ account: account, vendor:'belk' })
                    let urls = links ? links.producturl : []
                    return res.status(200).json({ status: true, url: urls, msg: "All pages's urls fetched successfully" })
                }
                const pages = await BrandPage.find({}, { url: 1, _id: 0 });
                if (pages.length > 0) {
                    const secondurl = pages[0].url;
                    let resp = await handleSecondPageScraping(secondurl);
                    if (resp) {
                        let count = await BrandUrl.find({vendor:'belk'})
                        count = count[0]?.producturl.length
                        let data = new Scrappedbrand({ name: profile.name, email: profile.email, account: profile.account, brandname: brandname, brandurl: url, urls: count, })
                        await data.save();
                    } else {
                        res.status(500).json({ status: false, msg: "Error while second page scrapping. Refresh if url successfully fetched. if total url is not fetched then retry again." })
                    }
                }
                let links = await BrandUrl.findOne({ account: account, vendor:'belk' })
                let urls = links ? links.producturl : []
                res.status(200).json({ status: true, url: urls, msg: "All pages's urls fetched successfully" })
            } else res.status(404).json({ status: false, msg: "No url fetched or found. Please retry" })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while scraping data.' });
    }
};

exports.refreshdetails = async (req, res) => {
    try {
        const { account } = req.body
        let pages = await BrandPage.findOne({ account: account })
        pages = pages?.url.length;

        let urls = await BrandUrl.findOne({ account: account , vendor:'belk'})
        urls = urls?.producturl.length
        res.status(200).json({ status: true, page: pages, url: urls })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.currentdetails = async (req, res) => {
    try {
        const account = req.body.account
        console.log
        let totalurl = await BrandUrl.findOne({ account: account,vendor:'belk' })
        let totalurlnum = totalurl?.producturl.length || 0
        let fetchedproduct = await Product.countDocuments({ account: account })
        if (totalurl) {
            res.status(200).json({ status: true, url: totalurlnum, fetched: fetchedproduct, link: totalurl.producturl })
        } else {
            res.status(404).json({ status: '404', msg: 'No previous data found' })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deleteurl = async (req, res) => {
    try {
        const { account, url } = req.body
        let resp = await BrandUrl.findOneAndUpdate(
            { account: account, vendor:'belk' },
            { $pull: { producturl: url } },
            { new: true }
        )
        if (resp)
            res.status(200).json({ status: true, data: resp.producturl })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.removeexistingurl = async (req, res) => {
    try {
        const file = req.file;
        if (!file || !file.path) {
            return res.status(400).json({ status: false, message: "No file uploaded or file path missing." });
        }
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = xlsx.utils.sheet_to_json(sheet);

        // Extract and deduplicate Vendor URLs
        let vendorUrls = parsedData
            .filter((d) => d['Vendor URL'])
            .map((d) => d['Vendor URL'].split(".html")[0] + ".html");
        vendorUrls = [...new Set(vendorUrls)];

        const brandUrl = await BrandUrl.findOne();
        if (!brandUrl) {
            return res.status(404).json({ status: false, message: "No BrandUrl data found in the database." });
        }

        let { _id, producturl: existingUrls } = brandUrl;
        existingUrls = [...new Set(existingUrls)];

        // Remove matching URLs
        const updatedUrls = existingUrls.filter((url) => !vendorUrls.includes(url));
        const removedCount = existingUrls.length - updatedUrls.length;

        // Update the database with the filtered URLs
        await BrandUrl.findOneAndUpdate(
            { _id },
            { $set: { producturl: updatedUrls } },
            { new: true }
        );

        // Send the response
        res.status(200).json({ status: true, count: removedCount });
    } catch (err) {
        console.error("Error in removeExistingUrl:", err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

exports.getproduct = async (req, res) => {
    try {
        const urlarray = await BrandUrl.find({vendor:'belk'});
        let arrayid = urlarray[0]._id
        const urls = urlarray[0].producturl;
        for (let index = 0; index < urls.length;) {
            let result = await getupc(urls[index]);
            if (result === 1) {
                await BrandUrl.updateOne(
                    { _id: arrayid },
                    { $pull: { producturl: urls[index] } }
                )
                index++
            } else {
                console.log("UPC data not found or error occurred for:", urls[index]);
            }
        }


        res.send("Product data fetched successfully");

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ error: 'Failed to fetch product data' });
    }
};

exports.editshippingcost = async (req, res) => {
    try {
        const { id, value } = req.body

        await finalProduct.findOneAndUpdate(
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

exports.setchecked = async (req, res) => {
    try {
        const { id } = req.body;
        await finalProduct.findOneAndUpdate({ _id: id }, { $set: { isCheked: true } }, { new: true });
        res.status(200).json({ status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.editsku = async (req, res) => {
    try {
        const id = req.body.id
        const newsku = req.body.newsku
        let resp = await finalProduct.findOneAndUpdate(
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

function extractProductUrls(html) {
    // Parse HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const productLinks = document.querySelectorAll('.thumb-link');
    return Array.from(productLinks).map(link => link.getAttribute('href'));
}

exports.fetchurl = async (req, res) => {
    try {
        const html = req.body.html;
        const profile = req.body.profile
        const account = profile.account;
        let result = extractProductUrls(html)

        if (Array.isArray(result) && result.length > 0) {
            let producturl = result.map((r) => 'https://www.belk.com' + r);
            let prev = await BrandUrl.find({ account: account });
            if (prev.length > 0) {
                let prevarr = prev[0].producturl;
                producturl.push(prevarr)
                let newarr = producturl.flat()
                newarr = [...new Set(newarr)]
                let updatedarr = await BrandUrl.findByIdAndUpdate(
                    { _id: prev[0]._id },
                    { $set: { producturl: newarr } },
                    { new: true }
                )
                res.status(200).json({ status: true, url: updatedarr.producturl.length, fetched: 0, link: updatedarr.producturl })
            } else {

                let brandname = producturl[0].split('/')[4].split('-')[0]
                let isexisting = await checkifbrandalreadyscrap(brandname, 'belk')
                if (isexisting) {
                    let matched = await Scrappedbrand.findOne({ brandurl: isexisting });
                    if (!matched) {
                        matched = await Scrappedbrand.findOne({ brandname: brandname })
                    }
                    return res.json({ status: 'exist', data: matched })
                } else {
                    let data = new Scrappedbrand({ name: profile.name, email: profile.email, brandname: brandname, brandurl: producturl[0], vendor: 'belk' })
                    let saved = await data.save();
                    console.log(saved)
                    let newurllist = new BrandUrl({ producturl: producturl, account: account, vendor: 'belk' })
                    let resp = await newurllist.save();
                    res.status(200).json({ status: true, url: resp.producturl.length, fetched: 0, link: resp.producturl })
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
