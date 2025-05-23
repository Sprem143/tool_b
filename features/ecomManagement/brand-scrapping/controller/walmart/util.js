
require('dotenv').config();
const apikey = process.env.API_KEY
const cheerio = require('cheerio')
const Product = require('../../model/products');
const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;
const ErrorUrl = require('../../model/ErrorUrl')
const puppeteer = require('puppeteer-core');
const { JSDOM } = require("jsdom");
    const { getJson } = require("serpapi");

const generatesku = (upc, prefix, color = '', size = '') => {
    let a = size.split(' ');
    if (a[1] && a[1].length > 1) {
        a[1] = a[1].slice(0, 1)
    }
    a = a.join('');
    size = a
    color = color.replaceAll(' ', '-').replaceAll('/', '-').toUpperCase();
    let firstletter = color.charAt(0)
    color = color.slice(1)
    var modifiedColor = color
    if (color.length > 12) {
        let v = ['A', 'E', 'I', 'O', 'U'];
        for (let i of v) {
            modifiedColor = color.replaceAll(i, '');
            color = modifiedColor
        }
    }
    if (color.length > 12) {
        let arr = color.split('-');
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].slice(0, 3)
        }
        color = arr.join('-')
    }

    let sku = prefix + '-' + upc + '-' + firstletter + color + '-' + size
    sku = sku.replaceAll('---', '-')
    sku = sku.replaceAll('--', '-')
    sku = sku.replaceAll(',', '')
    return sku;
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function scrapeProductFromUrl(url, account, extractVariants = false, prefix = 'RC-R3') {
console.log(url)
    let browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    const html = await page.content();
    const $ = cheerio.load(html);
    console.log('html receive')
    await page.close();
    let variantUrls = [];

    if (extractVariants) {
        const schemaScript = $('script[data-seo-id="schema-org-product"]').html()?.trim();
        if (schemaScript) {
            try {
                const parsed = JSON.parse(schemaScript);
                const variants = parsed?.[0]?.hasVariant || [];
                variants.shift(); // Remove self
                variantUrls = variants.map(v => v.url);
            } catch (err) {
                console.error("Schema JSON parse error:", err.message);
            }
        }
    }

    const nextDataScript = $('script#__NEXT_DATA__').html()?.trim();
    const jsonData = JSON.parse(nextDataScript);
    const data = jsonData?.props?.pageProps?.initialData?.data?.product;
    const clrszdata = jsonData?.props?.pageProps?.initialData?.data?.idml.specifications

    if (!data) throw new Error("Main product data not found");
    const quantity = data?.fulfillmentOptions[0]?.availableQuantity
    let color = '';
    let size = '';
    let varient = data.selectedVariantIds
    if (varient.length == 1 && varient[0].includes('_size-')) {
        size = varient[0].split('-')[1]
    }
    if (varient.length == 1 && varient[0].includes('_color-')) {
        color = varient[0].split('-')[1]
    }
    if (varient.length > 1) {
        size = varient.find((v) => v.includes('_size-'))
        size = size.split('-')[1]

        color = varient.find(v => v.includes('_color-'))
        color = color.split('-')[1]
    }
    if (color == '') {
        let pcolor = clrszdata.find(d => d.name == 'Color')
        color = pcolor?.value || ''
    }
    if (size == '') {
        let psize = clrszdata.find(d => d?.name.includes('Size'))
        size = psize?.value || ''
    }

    const product = {
        account: account,
        vendor: 'walmart',
        Brand: data?.brand?.toLowerCase(),
        productid: data?.id,
        upc: data?.upc,
        sku: generatesku(data.upc, prefix, color, size),
        price: data?.conditionOffers?.[0]?.price?.price,
        available: data?.availabilityStatus,
        quantity: Number(quantity),
        belkTitle: data?.name,
        url: 'https://www.walmart.com' + data?.canonicalUrl,
        type: data?.type,
        color,
        size,
        imgurl: data?.imageInfo?.thumbnailUrl

    };
    console.log(product.upc)
    return { product, variantUrls };
}

async function walmartproductscraper(url, account) {
    let numSaved = 0;
    if (!url.includes('?') && !url.includes('%')) {

        try {
            const variantUrl = url + '?classType=VARIANT&adsRedirect=true';
            let attempts = 0;
            let success = false;

            while (!success && attempts < 2) {
                try {
                    const { product: variantProduct } = await scrapeProductFromUrl(variantUrl, account, false);
                    const saved = await new Product(variantProduct).save();
                    if (saved) numSaved += 1;
                    success = true;
                } catch (err) {
                    console.error(`Variant error (attempt ${attempts + 1}): ${variantUrl}`, err.message);
                    attempts++;
                    await delay(5000)
                }
            }

            if (!success) {
                console.warn("Failed to process after retries:", variantUrl);
            }
            console.log("Total products saved:", numSaved);
            return numSaved;
        } catch (e) {
            console.error("Top-level error:", e.message);
            return numSaved;
        }

    } else {
        try {
            // Scrape parent product and extract variant URLs
            console.log(url)
            const { product: parentProduct, variantUrls } = await scrapeProductFromUrl(url, account, true);
            try {
                const saved = await new Product(parentProduct).save();
                if (saved) numSaved += 1;
            } catch (e) {
                console.error("Failed to save parent product:", e.message);
            }
            for (let variantPath of variantUrls) {
                const variantUrl = variantPath + '?classType=VARIANT&adsRedirect=true';
                let attempts = 0;
                let success = false;

                while (!success && attempts < 2) {
                    try {
                        const { product: variantProduct } = await scrapeProductFromUrl(variantUrl,account, false);
                        const saved = await new Product(variantProduct).save();
                        if (saved) numSaved += 1;
                        success = true;
                    } catch (err) {
                        console.error(`Variant error (attempt ${attempts + 1}): ${variantUrl}`, err.message);
                        attempts++;
                        if (attempts == 1) {
                            let errorurl = variantUrl.split('?')[0]
                            await new ErrorUrl({ producturl: errorurl, vendor: 'walmart', account: account }).save()
                        }
                        await delay(5000)
                    }
                }
                if (!success) {
                    console.warn("Failed to process after retries:", variantUrl);
                }
            }

            console.log("Total products saved:", numSaved);
            return numSaved;
        } catch (e) {
            console.error("Top-level error:", e.message);
            return numSaved;
        }
    }

}

function extractProductData(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Select all <a> elements inside <div class="hide-child-opacity">
    const anchors = document.querySelectorAll('div.pr4-xl div.hide-child-opacity a.hide-sibling-opacity');
    const brandDiv = document.querySelectorAll('div.mb1.mt2.b.f6.black.mr1.lh-solid');

 let brands= Array.from(brandDiv).map(brand=> brand.textContent.trim()).filter(Boolean) || []
 brands = [...new Set(brands)]
console.log(brands)
    let hrefs = Array.from(anchors)
        .map(anchor => anchor.href)
        .filter(Boolean);
hrefs = hrefs.map((h)=> h.includes('https://www.walmart.com')? h : 'https://www.walmart.com'+h)
console.log(hrefs)
    return {hrefs, brands}
}

module.exports = { walmartproductscraper, extractProductData }