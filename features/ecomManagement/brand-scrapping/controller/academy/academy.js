require('dotenv').config();
const apikey = process.env.API_KEY
const cheerio = require('cheerio')
const Product = require('../../model/products');
const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;
const ErrorUrl = require('../../model/ErrorUrl')
const puppeteer = require('puppeteer-core');
const { JSDOM } = require("jsdom");
const BrandPage = require('../../model/brandpage');
const BrandUrl = require('../../model/brandurl');
exports.academy = async (req, res) => {
    try {
        const { url, num, brandname, account } = req.body
        // ----first page scraping-
        let browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
        console.log(url)
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        await page.close();
        let productUrls = []
        $('div.imageRelativeWrapper--n_SvF a').each((index, element) => {
            const url = $(element).attr('href');
            if (url) {
                url.startsWith('https://www.academy.com/') ? productUrls.push(url) : productUrls.push(`https://www.academy.com/${url}`);
            }
        })

    let producturl =await new BrandUrl({ producturl: productUrls, account: account, vendor: 'academy', brand: '', account: account }).save()

        let i = 2
        let pagesArr = []
        while (i <= num) {
            pagesArr.push(url + `&page_${i}`)
            i += 1
        }

        for (let i of pagesArr) {

        }

        let savedPages = new BrandPage({ url: pagesArr, account: account, vendor: 'academy' })
        let resp = await savedPages.save();
        console.log(resp)
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}