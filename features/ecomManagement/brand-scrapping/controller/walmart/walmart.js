require('dotenv').config();
const apikey = process.env.API_KEY
const BrandPage = require('../../model/brandpage');
const BrandUrl = require('../../model/brandurl');
const axios = require('axios');
const cheerio = require('cheerio')
const Product = require('../../model/products');
const finalProduct = require('../../model/finalProduct');
const Scrappedbrand = require('../../model/scrappedbrand')
const xlsx = require('xlsx')
const { ZenRows } = require("zenrows");
const fetch = require('node-fetch');

exports.fetchurl = async (req, res) => {
    try {
        const { url, num, brandname, account } = req.body
        if (url && account && num && brandname) {
            await Promise.all([
                BrandPage.deleteMany({ vendor: 'walmart', account: account }),
                BrandUrl.deleteMany({ account: account, vendor: 'walmart' }),
                Product.deleteMany({ account: account, vendor: 'walmart' })
            ])
        }
        if (!url || !account || !num || !brandname) {
            return res.status(500).json({ status: false, msg: 'Some required details not found. Re-login and try again with proper brand name, number of pages' })
        }

        // -------------get first page links------
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        const $ = cheerio.load(html);
        let productUrls = [];
        $('a.hide-sibling-opacity').each((index, element) => {
            const url = $(element).attr('href');
            if (url) {
                url.startsWith('https://www.walmart.com') ? productUrls.push(url) : productUrls.push(`https://www.walmart.com${url}`);
            }
        });
        if (productUrls.length > 0) {
            let producturl = new BrandUrl({ producturl: productUrls, account: account, vendor: 'walmart', brand: brandname, account: account })
            await producturl.save()
        }


        // -------save pages of brand-----
        let pageurl = []
        for (let i = 2; i <= num; i++) {
            pageurl.push(`${url}page=${i}&affinityOverride=default`)
        }
        let savepages = new BrandPage({ url: pageurl, account: account, brand: brandname, vendor: 'walmart' })
        let savedpages = await savepages.save();
        savedpages = savedpages ? savedpages?.url : []

        // ----iterate over each page to scrap product urls-------

        if (savedpages && Array.isArray(savedpages)) {
            for (let i = 0; i < savedpages.length;) {

                const request = await client.get(url, {
                    premium_proxy: true,
                    js_render: true,
                });
                const html = await request.text();
                const $ = cheerio.load(html);
                $('a.hide-sibling-opacity').each((index, element) => {
                    const url = $(element).attr('href');
                    if (url) {
                        url.startsWith('https://www.walmart.com') ? productUrls.push(url) : productUrls.push(`https://www.walmart.com${url}`);
                    }
                });
                productUrls.length > 0 ? i += 1 : null
            }
        }
        if (productUrls.length > 0) {
            let saved = await BrandUrl.findOneAndUpdate(
                { account: account, vendor: 'walmart' },
                { producturl: productUrls },
                { new: true }
            )

            if (saved && saved?.producturl.length > 0) {
                res.status(200).json({ status: true, data: saved.producturl })
            }
        }else{
            res.status(500).json({status:false, msg:'No url found. Please try again'})
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}


exports.currentdetails = async (req, res) => {
    try {
        const account = req.body.account
        console.log(account)
        let totalurl = await BrandUrl.findOne({ account: account,vendor:'walmart' })
        let totalurlnum = totalurl?.producturl.length || 0
        let fetchedproduct = await Product.countDocuments({ account: account, vendor:'walmart' })
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
