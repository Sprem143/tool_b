require('dotenv').config();
const apikey = process.env.API_KEY
const BrandPage = require('../../model/brandpage');
const BrandUrl = require('../../model/brandurl');
const cheerio = require('cheerio')
const Product = require('../../model/products');
const puppeteer = require('puppeteer-core');
const { ZenRows } = require("zenrows");
const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;
const { extractProductData } = require('./util')
const Scrappedbrand = require('../../model/scrappedbrand');
const ErrorUrl = require('../../model/ErrorUrl')


exports.fetchurl = async (req, res) => {
    try {
        const { url, num, account } = req.body
        if (url && account && num) {
            await Promise.all([
                BrandPage.deleteMany({ vendor: 'walmart', account: account }),
                BrandUrl.deleteMany({ account: account, vendor: 'walmart' }),
                Product.deleteMany({ account: account, vendor: 'walmart' })
            ])
        }
        if (!url || !account || !num) {
            return res.status(500).json({ status: false, msg: 'Some required details not found. Re-login and try again with proper brand name, number of pages' })
        }

        // -------------get first page links------
        let browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
        console.log(url)
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 80000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        let productUrls = [];
        $('a.hide-sibling-opacity').each((index, element) => {
            const url = $(element).attr('href');
            if (url) {
                url.startsWith('https://www.walmart.com') ? productUrls.push(url) : productUrls.push(`https://www.walmart.com${url}`);
            }
        });
        let brandName = []
        $('div.mb1.mt2.b.f6.black.mr1.lh-solid').each((index, element) => {
            const b = $(element).text().trim()
            brandName.push(b)
        })
        brandName = [...new Set(brandName)]
        // ------check if brand already scrapped
        if (brandName.length == 0) {
            return res.status(404).json({ status: '404', msg: 'No brand details found' })
        } else if (brandName.length > 1) {
            return res.status(500).json({ status: '500', msg: 'I found more than one brand in this page. At a time i can precess only one brand. So filter by brand and try again' })
        }
        // -------check if brand already exist------
        let isexisting = await Scrappedbrand.findOne({ brandname: brandName[0] })
        if (isexisting) {
            let matched = await Scrappedbrand.findOne({ brandname: brandName[0] });
            return res.json({ status: 'exist', data: matched })
        } else {
            if (productUrls.length > 0) {
                let producturl = new BrandUrl({ producturl: productUrls, account: account, vendor: 'walmart', brand: brandName[0], account: account })
                await producturl.save()
            }
        }
        if (num == 1) {
            let newdata = new Scrappedbrand({ account: account, brandname: brandName[0], brandurl: '', vendor: 'walmart' })
            await newdata.save();
            let data = await BrandUrl.find({ account: account, vendor: 'walmart' })
            let brand = data.brand
            data = data ? data.producturl : []

            return res.status(200).json({ status: true, data: data, brand: brand })
        }
        // -------save pages of brand-----

        let pageurl = []
        for (let i = 2; i <= num; i++) {
            pageurl.push(`${url}&page=${i}&affinityOverride=default`)
        }
        let savepages = new BrandPage({ url: pageurl, account: account, brand: brandName[0], vendor: 'walmart' })
        let savedpages = await savepages.save();
        savedpages = savedpages ? savedpages?.url : []

        // ----iterate over each page to scrap product urls-------

        if (savedpages && Array.isArray(savedpages)) {

            for (let i = 0; i < pageurl.length;) {
                console.log(`${i + 1} page processing`)
                let savedurl = await BrandUrl.findOne({ vendor: 'walmart', account: account })
                savedurl = savedurl?.producturl || []
                let browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
                console.log(pageurl[i])
                const page = await browser.newPage();
                await page.goto(pageurl[i], { waitUntil: 'networkidle2', timeout: 120000 });
                const html = await page.content();
                const $ = cheerio.load(html);
                $('a.hide-sibling-opacity').each((index, element) => {
                    const url = $(element).attr('href');
                    if (url) {
                        url.startsWith('https://www.walmart.com') ? savedurl.push(url) : savedurl.push(`https://www.walmart.com${url}`);
                    }
                });

                let saved = await BrandUrl.findOneAndUpdate(
                    { account: account, vendor: 'walmart' },
                    { producturl: savedurl },
                    { new: true }
                )
                saved ? i += 1 : null
            }
        }
        let newbrand = new Scrappedbrand({ account: account, brandname: brandName[0], brandurl: '', vendor: 'walmart' })
        await newbrand.save();
        let data = await BrandUrl.find({ account: account, vendor: 'walmart' })
        let brand = data.brand
        data = data ? data.producturl : []

        return res.status(200).json({ status: true, data: data, brand: brand })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.currentdetails = async (req, res) => {
    try {
        const account = req.body.account
        let totalurl = await BrandUrl.findOne({ account: account, vendor: 'walmart' })

        let links = totalurl?.producturl
        links = [...new Set(links)]
        let totalurlnum = links.length || 0
        let fetchedproduct = await Product.countDocuments({ account: account, vendor: 'walmart' }) || 0
        res.status(200).json({ status: true, url: totalurlnum, fetched: fetchedproduct, link: links })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.downloadProductExcel = async (req, res) => {
    try {
        const account = req.body.account;
        // let productlist = await Product.find({ account: account, vendor:'walmart' });
        // let productlist = await Product.find();
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
        const products = await Product.find({vendor:'walmart', quantity:{$gt:4}});
        res.status(200).json({ status: true, data: products })

    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deleteoldurls = async (req, res) => {
    try {
        const account = req.body.account
        let resp = await BrandUrl.deleteMany({ account: account, vendor: 'walmart' })
        await ErrorUrl.deleteMany({vendor:'walmart', account:'account'})
        res.status(200).json({ status: true, msg: resp.deletedCount })
    } catch (err) {
        conole.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}

exports.fetchurl2 = async (req, res) => {


    try {
        const html = req.body.html;
        const profile = req.body.profile
        const account = profile.account;
        let alrtmsg;
        let { hrefs, brands } = extractProductData(html)
        if (brands.length == 0) {
            return res.status(404).json({ status: '404', msg: 'No brand details found' })
        } else if (brands.length > 1) {
           alrtmsg = `In this page, I found more than one brands - ${brands[0].toUpperCase()}, ${brands[1].toUpperCase()}${brands.length > 2 ? `, ${brands[2].toUpperCase()}` : ''}${brands.length > 3 ? `, ${brands[3].toUpperCase()}` : ''}${brands.length > 4 ? ' and many more' : ''}. Make sure all brands are approved on Amazon or remove these products.`;
        }


        if (Array.isArray(hrefs) && hrefs.length > 0) {
            let producturl = hrefs.map((r) => r);
            let prev = await BrandUrl.find({ account: account, vendor: 'walmart' });
            if (prev.length > 0) {
                let prevarr = prev[0].producturl;
                producturl.push(prevarr)
                let newarr = producturl.flat()
                let updatedarr = await BrandUrl.findByIdAndUpdate(
                    { _id: prev[0]._id },
                    { $set: { producturl: newarr } },
                    { new: true }
                )
                res.status(200).json({ status: true, data: updatedarr.producturl, brand: brands[0], msg: alrtmsg })
            } else {
                let brandname = brands[0]
                let isexisting = await Scrappedbrand.findOne({ brandname: brandname })
                if (isexisting) {
                    let matched = await Scrappedbrand.findOne({ brandname: brandname });
                    return res.json({ status: 'exist', data: matched })
                } else {
                    // delete previous data
                    await Promise.all([
                        BrandPage.deleteMany({ vendor: 'walmart', account: account }),
                        BrandUrl.deleteMany({ vendor: 'walmart', account: account }),
                        Product.deleteMany({ vendor: 'walmart', account: account })
                    ])
                    let data = new Scrappedbrand({ name: profile.name, email: profile.email, brandname: brandname, brandurl: '', vendor: 'walmart' })
                    await data.save();
                    let newurllist = new BrandUrl({ producturl: producturl, account: account, vendor: 'walmart', brand: brandname })
                    let resp = await newurllist.save();
                    res.status(200).json({ status: true, data: resp.producturl, brand: brandname, msg: alrtmsg })
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

exports.refreshdetails = async (req, res) => {
    try {
        const { account } = req.body
        let pages = await BrandPage.findOne({ account: account, vendor: 'walmart' })
        pages = pages?.url.length;

        let urls = await BrandUrl.findOne({ account: account, vendor: 'walmart' })
        urls = urls?.producturl.length
        res.status(200).json({ status: true, page: pages, url: urls })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}
