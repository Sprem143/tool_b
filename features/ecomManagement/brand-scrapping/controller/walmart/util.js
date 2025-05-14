require('http').globalAgent.maxHeaderSize = 16384; // 16KB or higher
require('https').globalAgent.maxHeaderSize = 16384;
const ProductBackup = require('../../model/productBackup')
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
const puppeteer = require('puppeteer');
const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;
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


// async function walmartproductscraper(url, account) {
//     console.log("Main URL:", url);
//     let num = 0;

//     try {
//         (async () => {
//             const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
//             const page = await browser.newPage();

//             await page.goto(url, { waitUntil: 'networkidle2' }); // ensures page fully loads

//             const html = await page.content(); // get full HTML of the loaded page
//             const $ = cheerio.load(html);

//             let linkContent = $('script[data-seo-id="schema-org-product"]').html()?.trim();
//             let parseData = [];

//             if (linkContent) {
//                 try {
//                     parseData = JSON.parse(linkContent);
//                 } catch (e) {
//                     console.error("Invalid JSON in schema-org-product:", e.message);
//                 }
//             }

//             let linkstack = [];
//             if (Array.isArray(parseData)) {
//                 let variants = parseData[0]?.hasVariant || [];
//                 variants.shift(); // Remove self if present
//                 linkstack = variants.map((c) => c.url);
//             }
//             console.log(linkstack.length)

//             // ------- Fetch parent product details -------
//             const scriptContent = $('script#__NEXT_DATA__').html()?.trim();
//             const jsonData = JSON.parse(scriptContent);
//             const data = jsonData.props?.pageProps?.initialData?.data?.product;

//             if (!data) throw new Error("Main product data not found");

//             let islowquantity = '';
//             if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
//                 islowquantity = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1];
//             }

//             let color = data.selectedVariantIds?.[0]?.replace('actual_color-', '') || '';
//             let size = data.selectedVariantIds?.[1]?.replace('size-', '') || '';
//             let prefix = 'RC-R3';

//             const product = {
//                 brand: data?.brand?.toLowerCase(),
//                 productid: data?.id,
//                 upc: data?.upc,
//                 sku: generatesku(data.upc, prefix, color, size),
//                 price: data?.conditionOffers?.[0]?.price?.price,
//                 available: data?.availabilityStatus,
//                 quantity: Number(islowquantity),
//                 belkTitle: data?.name,
//                 url: 'https://www.walmart.com' + data?.canonicalUrl,
//                 type: data?.type,
//                 color,
//                 size,
//                 imgurl: data?.variantsMap?.[data.id]?.imageInfo?.allImages?.[0]?.url
//             };

//             try {
//                 const newProduct = new Product(product);
//                 const resp = await newProduct.save();
//                 console.log(resp)
//                 if (resp) num += 1;
//             } catch (e) {
//                 console.error("Failed to save parent product:", e.message);
//             }
//             await browser.close();
//         })();

//         // ------- Loop through child variant URLs with retry -------
//         for (let childUrl of linkstack) {
//             let success = false;
//             let attempt = 0;

//             while (!success && attempt < 2) {
//                 try {
//                     console.log(`Processing child URL (attempt ${attempt + 1}): ${childUrl}`);

//                     (async () => {
//                         const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
//                         const page = await browser.newPage();

//                         await page.goto(url, { waitUntil: 'networkidle2' }); // ensures page fully loads

//                         const html = await page.content(); // get full HTML of the loaded page
//                         const $ = cheerio.load(html);

//                         let linkContent = $('script[data-seo-id="schema-org-product"]').html()?.trim();
//                         let parseData = [];

//                         if (linkContent) {
//                             try {
//                                 parseData = JSON.parse(linkContent);
//                             } catch (e) {
//                                 console.error("Invalid JSON in schema-org-product:", e.message);
//                             }
//                         }

//                         let linkstack = [];
//                         if (Array.isArray(parseData)) {
//                             let variants = parseData[0]?.hasVariant || [];
//                             variants.shift(); // Remove self if present
//                             linkstack = variants.map((c) => c.url);
//                         }
//                         console.log(linkstack.length)

//                         // ------- Fetch parent product details -------
//                         const scriptContent = $('script#__NEXT_DATA__').html()?.trim();
//                         const jsonData = JSON.parse(scriptContent);
//                         const data = jsonData.props?.pageProps?.initialData?.data?.product;

//                         if (!data) throw new Error("Main product data not found");

//                         let islowquantity = '';
//                         if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
//                             islowquantity = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1];
//                         }

//                         let color = data.selectedVariantIds?.[0]?.replace('actual_color-', '') || '';
//                         let size = data.selectedVariantIds?.[1]?.replace('size-', '') || '';
//                         let prefix = 'RC-R3';

//                         const product = {
//                             brand: data?.brand?.toLowerCase(),
//                             productid: data?.id,
//                             upc: data?.upc,
//                             sku: generatesku(data.upc, prefix, color, size),
//                             price: data?.conditionOffers?.[0]?.price?.price,
//                             available: data?.availabilityStatus,
//                             quantity: Number(islowquantity),
//                             belkTitle: data?.name,
//                             url: 'https://www.walmart.com' + data?.canonicalUrl,
//                             type: data?.type,
//                             color,
//                             size,
//                             imgurl: data?.variantsMap?.[data.id]?.imageInfo?.allImages?.[0]?.url
//                         };
//                         const newProduct = new Product(product);
//                         const resp = await newProduct.save();
//                         if (resp) num += 1;
//                         console.log("Saved product count:", num);
//                         success = true;
//                         await browser.close();
//                     })();
//                 } catch (childErr) {
//                     console.error(`Error (attempt ${attempt + 1}) for ${childUrl}:`, childErr);
//                     attempt += 1;
//                 }
//             }

//             if (!success) {
//                 console.warn(`Failed to process child URL after retrying: ${childUrl}`);
//             }
//         }

//         console.log("Total products saved:", num);
//         return num;
//     } catch (e) {
//         console.error("Top-level error:", e.message);
//         return num; // return whatever succeeded
//     }
// }



async function scrapeProductFromUrl(url, browser, extractVariants = false, prefix = 'RC-R3') {
    console.log(url)
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    const $ = cheerio.load(html);

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

    if (!data) throw new Error("Main product data not found");

    const islowquantity = data?.badges?.groups?.[0]?.members?.[0]?.badgeContent?.[0]?.value?.split(' ')[1] || '0';
    const color = data.selectedVariantIds?.[0]?.replace('actual_color-', '') || '';
    const size = data.selectedVariantIds?.[1]?.replace('size-', '') || '';

    const product = {
        brand: data?.brand?.toLowerCase(),
        productid: data?.id,
        upc: data?.upc,
        sku: generatesku(data.upc, prefix, color, size),
        price: data?.conditionOffers?.[0]?.price?.price,
        available: data?.availabilityStatus,
        quantity: Number(islowquantity),
        belkTitle: data?.name,
        url: 'https://www.walmart.com' + data?.canonicalUrl,
        type: data?.type,
        color,
        size,
        imgurl: data?.variantsMap?.[data.id]?.imageInfo?.allImages?.[0]?.url
    };

    await page.close();

    return { product, variantUrls };
}

async function walmartproductscraper(url, account) {
    console.log("Main URL:", url);
    let numSaved = 0;

    try {
        const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });

        // Scrape parent product and extract variant URLs
        const { product: parentProduct, variantUrls } = await scrapeProductFromUrl(url, browser, true);

        try {
            const saved = await new Product(parentProduct).save();
            if (saved) numSaved += 1;
        } catch (e) {
            console.error("Failed to save parent product:", e.message);
        }

        // Process child variants (no need to extract variant URLs again)
        for (let variantPath of variantUrls) {
            const variantUrl = variantPath;
            let attempts = 0;
            let success = false;

            while (!success && attempts < 2) {
                try {
                    const { product: variantProduct } = await scrapeProductFromUrl(variantUrl, browser, false);
                    const saved = await new Product(variantProduct).save();
                    if (saved) numSaved += 1;
                    success = true;
                } catch (err) {
                    console.error(`Variant error (attempt ${attempts + 1}): ${variantUrl}`, err.message);
                    attempts++;
                }
            }

            if (!success) {
                console.warn("Failed to process after retries:", variantUrl);
            }
        }

        await browser.close();
        console.log("Total products saved:", numSaved);
        return numSaved;
    } catch (e) {
        console.error("Top-level error:", e.message);
        return numSaved;
    }
}



module.exports = { walmartproductscraper }