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
const puppeteer = require('puppeteer-core');
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
//     console.log(url)
//     try {
//         const client = new ZenRows(apikey);
//         const request = await client.get(url, {
//             premium_proxy: true,
//             js_render: true,
//         });
//         const html = await request.text();
//         const $ = cheerio.load(html);
//         // -----fetch  child link------------
//         let linkContent = $('script[data-seo-id="schema-org-product"]').html().trim();

//         let parseData;
//         try {
//             parseData = JSON.parse(linkContent);
//         } catch (e) {
//             console.error("Invalid JSON", e);
//         }
//         let linkstack;
//         if (Array.isArray(parseData)) {
//             let contextValue = parseData[0]['hasVariant'];
//             Array.isArray(contextValue) && contextValue.shift()
//             linkstack = contextValue.map((c) => c.url)
//         }
//         console.log(linkstack)
//         // -------fetch product details----
//         const scriptContent = $('script#__NEXT_DATA__').html().trim();
//         const jsonData = JSON.parse(scriptContent);
//         const data = jsonData.props?.pageProps?.initialData?.data.product;
//         let islowquantity = ''
//         if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
//             islowquantity = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1]
//         }
//         let color = data.selectedVariantIds[0].replace('actual_color-', '')
//         let size = data.selectedVariantIds[1].replace('size-', '')
//         let prefix = 'RC-R3'
//         let product = {
//             brand: data?.brand.toLowerCase(),
//             productid: data?.id,
//             upc: data.upc,
//             sku: generatesku(data.upc, prefix, color, size),
//             price: data?.conditionOffers[0].price.price,
//             available: data?.availabilityStatus,
//             quantity: Number(islowquantity),
//             belkTitle: data.name,
//             url: 'https://www.walmart.com' + data.canonicalUrl,
//             type: data.type,
//             color: color,
//             size: size,
//             imgurl: data.variantsMap[data.id].imageInfo.allImages[0].url
//         }
//         let newProduct = new Product(product)
//         let resp = await newProduct.save()
//         let num = 0
//         resp ? num += 1 : null

//         //  --------scrap child url ----------
//         for (let i = 0; i < linkstack.length; i++) {
//             console.log(linkstack[i])
//             const request = await client.get(linkstack[i], {
//                 premium_proxy: true,
//                 js_render: true,
//             });
//             const html = await request.text();
//             const $ = cheerio.load(html);
//             const scriptContent = $('script#__NEXT_DATA__').html().trim();
//             const jsonData = JSON.parse(scriptContent);
//             const data = jsonData.props?.pageProps?.initialData?.data.product;
//             let islowquantity2 = ''
//             if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
//                 islowquantity2 = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1]
//             }
//             let color2 = data.selectedVariantIds[0].replace('actual_color-', '')
//             let size2 = data.selectedVariantIds[1].replace('size-', '')

//             let product = {
//                 brand: data?.brand.toLowerCase(),
//                 productid: data?.id,
//                 upc: data.upc,
//                 sku: generatesku(data.upc, prefix, color, size),
//                 price: data?.conditionOffers[0].price.price,
//                 available: data?.availabilityStatus,
//                 quantity: Number(islowquantity2),
//                 belkTitle: data.name,
//                 url: 'https://www.walmart.com' + data.canonicalUrl,
//                 type: data.type,
//                 color: color2,
//                 size: size2,
//                 imgurl: data.variantsMap[data.id].imageInfo.allImages[0].url
//             }
//             let newProduct = new Product(product)
//             let resp = await newProduct.save()
//             resp ? num += 1 : null
//             console.log(num)
//         }
//         console.log(num)
//         return num
//     } catch (e) {
//         console.error("JSON parse error:", e.message);
//     }
// }

async function walmartproductscraper(url, account) {
    console.log("Main URL:", url);
    let num = 0;

    try {
        // const client = new ZenRows(apikey);
        // const request = await client.get(url, {
        //     premium_proxy: true,
        //     js_render: true,
        // });
        // const html = await request.text();
        // const $ = cheerio.load(html);
        //  let response = await axios({
        //             url: 'https://api.zenrows.com/v1/',
        //             method: 'GET',
        //             params: {
        //                 'url': url,
        //                 'apikey': apikey,
        //                 'js_render': true,
        //                 'premium_proxy': true
        //             },
        //         });


    //    axios.get('https://ecommerce.api.zenrows.com/v1/targets/walmart/discovery/', {
    //         params: {
    //             apikey,
    //             url,
    //         },
    //     }) .then((response) => console.log(response.data))
    // .catch((error) => console.log(error));
(async () => {
  const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle2' }); // ensures page fully loads
  
  const html = await page.content(); // get full HTML of the loaded page
 const $ = cheerio.load(html);

   let linkContent = $('script[data-seo-id="schema-org-product"]').html()?.trim();
        let parseData = [];

        if (linkContent) {
            try {
                parseData = JSON.parse(linkContent);
            } catch (e) {
                console.error("Invalid JSON in schema-org-product:", e.message);
            }
        }

        let linkstack = [];
        if (Array.isArray(parseData)) {
            let variants = parseData[0]?.hasVariant || [];
            variants.shift(); // Remove self if present
            linkstack = variants.map((c) => c.url);
        }
        console.log(linkstack.length)

        // ------- Fetch parent product details -------
        const scriptContent = $('script#__NEXT_DATA__').html()?.trim();
        const jsonData = JSON.parse(scriptContent);
        const data = jsonData.props?.pageProps?.initialData?.data?.product;

        if (!data) throw new Error("Main product data not found");

        let islowquantity = '';
        if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
            islowquantity = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1];
        }

        let color = data.selectedVariantIds?.[0]?.replace('actual_color-', '') || '';
        let size = data.selectedVariantIds?.[1]?.replace('size-', '') || '';
        let prefix = 'RC-R3';

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

        try {
            const newProduct = new Product(product);
            const resp = await newProduct.save();
            console.log(resp)
            if (resp) num += 1;
        } catch (e) {
            console.error("Failed to save parent product:", e.message);
        }

  await browser.close();
})();
let response ='abc'
        const html = response.data;
        const $ = cheerio.load(html);
        console.log('got html')

        // ----- Fetch child variant links from schema.org -----
      
        // ------- Loop through child variant URLs with retry -------
        for (let childUrl of linkstack) {
            let success = false;
            let attempt = 0;

            while (!success && attempt < 2) {
                try {
                    console.log(`Processing child URL (attempt ${attempt + 1}): ${childUrl}`);
                    // const request = await client.get(childUrl, {
                    //     premium_proxy: true,
                    //     js_render: true,
                    // });
                    //  let response = await axios({
                    //             url: 'https://api.zenrows.com/v1/',
                    //             method: 'GET',
                    //             params: {
                    //                 'url': url,
                    //                 'apikey': apikey,
                    //                 'js_render': true,
                    //                 'premium_proxy': true
                    //             },
                    //         });

                    let response =await axios.get('https://ecommerce.api.zenrows.com/v1/targets/walmart/products/', {
                        params: {
                            apikey,
                            url,
                        },
                    })

                    const html = response.data;
                    const $ = cheerio.load(html);
                    // const html = await request.text();
                    // const $ = cheerio.load(html);

                    const scriptContent = $('script#__NEXT_DATA__').html()?.trim();
                    const jsonData = JSON.parse(scriptContent);
                    const data = jsonData.props?.pageProps?.initialData?.data?.product;

                    if (!data) throw new Error("Child product data missing");

                    let islowquantity2 = '';
                    if (Array.isArray(data?.badges?.groups) && data?.badges?.groups.length > 0) {
                        islowquantity2 = data.badges.groups[0].members[0].badgeContent[0].value.split(' ')[1];
                    }

                    let color2 = data.selectedVariantIds?.[0]?.replace('actual_color-', '') || '';
                    let size2 = data.selectedVariantIds?.[1]?.replace('size-', '') || '';

                    const product = {
                        brand: data?.brand?.toLowerCase(),
                        productid: data?.id,
                        upc: data?.upc,
                        sku: generatesku(data.upc, prefix, color2, size2),
                        price: data?.conditionOffers?.[0]?.price?.price,
                        available: data?.availabilityStatus,
                        quantity: Number(islowquantity2),
                        belkTitle: data?.name,
                        url: 'https://www.walmart.com' + data?.canonicalUrl,
                        type: data?.type,
                        color: color2,
                        size: size2,
                        imgurl: data?.variantsMap?.[data.id]?.imageInfo?.allImages?.[0]?.url
                    };

                    const newProduct = new Product(product);
                    const resp = await newProduct.save();
                    if (resp) num += 1;
                    console.log("Saved product count:", num);
                    success = true;
                } catch (childErr) {
                    console.error(`Error (attempt ${attempt + 1}) for ${childUrl}:`, childErr);
                    attempt += 1;
                }
            }

            if (!success) {
                console.warn(`Failed to process child URL after retrying: ${childUrl}`);
            }
        }

        console.log("Total products saved:", num);
        return num;
    } catch (e) {
        console.error("Top-level error:", e.message);
        return num; // return whatever succeeded
    }
}


module.exports = { walmartproductscraper }