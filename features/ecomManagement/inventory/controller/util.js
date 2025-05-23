const AutoFetchData = require('../model/autofetchdata');
const InvProduct = require('../model/invProduct');
require('dotenv').config();
const { ZenRows } = require("zenrows");
const InvUrl = require('../model/invUrl');
const apikey = process.env.API_KEY;
const Outofstock = require('../model/outofstock');
const Todayupdate = require('../model/todayupdate');
const cheerio = require('cheerio');
const Product = require('../../brand-scrapping/model/products')
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;
const puppeteer = require('puppeteer-core');
const { JSDOM } = require("jsdom");
const outofstock = require('../model/outofstock');
async function belk_productData(html, variableName) {
    const $ = cheerio.load(html);
    let variableValue;
    $('script').each((index, script) => {
        const scriptContent = $(script).html();
        const regex = new RegExp(`${variableName}\\s*=\\s*({[^]*?});`);
        const match = regex.exec(scriptContent);

        if (match) {
            try {
                variableValue = JSON.parse(match[1]);
            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        }
    });
    return variableValue;
}

async function fetchProductData(html) {
    try {
        const $ = cheerio.load(html);
        let productData = null;
        $('script').each((index, element) => {
            const scriptContent = $(element).html();
            const regex = /window\.product\s*=\s*({[^]*?});/;
            const match = scriptContent.match(regex);
            if (match) {
                try {
                    // Parse the matched JSON-like object
                    productData = JSON.parse(match[1]);

                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            }
        });

        if (productData) {
            return productData;
        } else {
            console.log("Product data not found in HTML.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return null;
    }
}

function extractProductData(html) {
    const $ = cheerio.load(html);

    const scriptTag = $('#data-mz-preload-product');

    if (!scriptTag.length) {
        console.error('Script tag with id "data-mz-preload-product" not found.');
        return null;
    }

    let productData;
    try {
        productData = JSON.parse(scriptTag.html().trim());
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
    const volumePriceBands = productData?.volumePriceBands || null
    const upCs = productData?.upCs || [];
    const variations = productData?.variations || [];
    const img = productData?.mainImage.src || null;
    return { volumePriceBands, upCs, variations, img };
}

const boscov = async (url, account) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        if (html) {
            const productData = extractProductData(html);
            if (productData) {
                let oosdata = await InvProduct.find({ 'Product link': url + '.html' })
                if (Array.isArray(productData.variations) && productData.variations.length == 0) {
                    oosdata = oosdata.map((data) => ({
                        account: account,
                        'Product link': url,
                        'Current Quantity': 0,
                        'Product price': data['Product price'],
                        'Current Price': 0,
                        'PriceRange': arr,
                        'Image link': '',
                        'Input UPC': data['Input UPC'],
                        'Fulfillment': data['Fulfillment'],
                        'Amazon Fees%': data['Amazon Fees%'],
                        'Amazon link': data['Amazon link'],
                        'Shipping Template': data['Shipping Template'],
                        'Min Profit': data['Min Profit'],
                        ASIN: data.ASIN,
                        SKU: data.SKU,
                    }))
                    let resp = await AutoFetchData.insertMany(oosdata);
                    await Outofstock.insertMany(oosdata);
                    let deleteurl = url + '.html'
                    let deleted = await InvProduct.deleteMany({ account: account, 'Product link': deleteurl })
                    return deleted.length == resp.length ? true : false;
                }

                var lower, upper, price, middle;
                if (Array.isArray(productData.variations) && productData.volumePriceBands.length == 0) {
                    price = 0
                }
                else if (productData && productData.volumePriceBands[0].priceRange) {
                    const p = productData.volumePriceBands[0].priceRange
                    lower = p.lower.onSale ? p.lower.salePrice : p.lower.price
                    upper = p.upper.onSale ? p.upper.salePrice : p.lower.price
                    middle = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price;
                    price = upper
                } else if (productData.volumePriceBands) {
                    price = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price

                }

                let products = [];
                for (let i = 0; i < productData.variations.length; i++) {
                    let p = productData.variations[i];
                    let outofstock = p.inventoryInfo.onlineStockAvailable == 0 ? await getoutofstockdata(p.upc) : null;

                    products.push({
                        upc: p.upc,
                        price: price,
                        quantity: p.inventoryInfo.onlineStockAvailable,
                        color: p.options[0].value,
                        outofstock: outofstock,
                    });
                }

                var arr = [lower, middle, upper]
                arr = arr.filter((a, i, self) => self.indexOf(a) == i)
                let oosproduct = [];
                oosdata.forEach((data) => {
                    products.map((p) => {
                        if (data['Input UPC'] == 'UPC' + p.upc || data['Input UPC'] == p.upc) {
                            oosproduct.push({
                                account: account,
                                'Product link': url,
                                'Current Quantity': p.quantity,
                                'Product price': data['Product price'],
                                'Current Price': p.price,
                                'PriceRange': arr,
                                'Image link': '',
                                color: p.color,
                                'Input UPC': 'UPC' + p.upc,
                                'Fulfillment': data['Fulfillment'],
                                'Amazon Fees%': data['Amazon Fees%'],
                                'Amazon link': data['Amazon link'],
                                'Shipping Template': data['Shipping Template'],
                                'Min Profit': data['Min Profit'],
                                ASIN: data.ASIN,
                                SKU: data.SKU,
                                outofstock: p.outofstock
                            })
                        }
                    })
                })
                let saved = await AutoFetchData.insertMany(oosproduct);

                let deleteurl = url + '.html'
                let deleted = await InvProduct.deleteMany({ account: account, 'Product link': deleteurl })

                let filterData = oosproduct.filter((f) => f['Current Quantity'] == 0);
                if (filterData.length > 0) {
                    let ooslist = []
                    for (let i of filterData) {
                        let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
                        if (!isexist) {
                            ooslist.push(i)
                        }
                    }
                    await Outofstock.insertMany(ooslist)
                }
                return true
            }
        } else {
            return false
        }
    } catch (err) {
        console.log(err);
        return false
    }
}

const boscovbrandscraper = async (url, id, email) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        if (html) {
            const productData = extractProductData(html);
            var lower, upper, price, middle;
            if (productData.volumePriceBands.length == 0) {
                price = 0
            }
            else if (productData && productData.volumePriceBands[0].priceRange) {
                const p = productData.volumePriceBands[0].priceRange
                lower = p.lower.onSale ? p.lower.salePrice : p.lower.price
                upper = p.upper.onSale ? p.upper.salePrice : p.lower.price
                middle = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price;
                price = upper
            } else if (productData.volumePriceBands) {
                price = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price
            }
            var arr = [lower, middle, upper]
            arr = arr.filter((a, i, self) => self.indexOf(a) == i)
            const img = productData.img

            let products = productData.variations.map((p) => ({
                email: email,
                upc: p.upc,
                price: price,
                sku: generatesku(p.upc, p.options[0]?.value, p.options[1]?.value),
                pricerange: arr,
                quantity: p.inventoryInfo.onlineStockAvailable,
                color: p.options[0]?.value,
                size: p.options[1]?.value,
                imgurl: img,
                url: url
            }))

            await Product.insertMany(products)
            return true;
        } else {
            return false
        }
    } catch (err) {
        console.log(err);
        return false
    }
}

function fetchoffer(html, couponcode) {
    try {
        const $ = cheerio.load(html);
        let productData = null;
        $('script').each((index, element) => {
            const scriptContent = $(element).html();
            const regex = /window\.product\s*=\s*({[^]*?});/;
            const match = scriptContent.match(regex);
            if (match) {
                try {
                    productData = JSON.parse(match[1]);

                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            }
        });

        if (productData) {
            let eligiblecoupon;
            if (productData.coupon && Array.isArray(productData.coupon.coupons)) {
                eligiblecoupon = productData.coupon.coupons.filter((c) => c.couponCode === couponcode && c.isBelkTenderCoupon === false)
            }
            if (Array.isArray(eligiblecoupon) && eligiblecoupon.length > 0) {
                return true;
            }
        } else {
            console.log("Product data not found in HTML.");
            return false;
        }
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return false;
    }
}

const saveData = async (utagData, url, account, html) => {

    const couponcode = utagData['product_promotedCoupon'] ? utagData['product_promotedCoupon'][0].couponCode : null;
    const isCoupon = couponcode !== null || undefined ? fetchoffer(html, couponcode) : null;

    var datas = await InvProduct.find({ 'Product link': url });
    const price = utagData.sku_price;
    const upc = utagData.sku_upc;
    const quantity = utagData.sku_inventory;
    const imgurl = utagData.sku_image_url;
    const onsale = utagData.sku_on_sale;
    const coupon = utagData.product_promotedCoupon[0]?.cpnDiscount || null;
    const brand = utagData?.product_brand[0]
    const getoutofstockdata = async (upc) => {
        let UPC = 'UPC' + upc;
        let product = await Outofstock.findOne({ 'Input UPC': UPC });
        return product ? product.Date : '';
    };
    const urlProduct = [];
    for (let i = 0; i < upc.length; i++) {
        const outofstock = quantity[i] == 0 ? await getoutofstockdata(upc[i]) : null;

        urlProduct.push({
            upc: 'UPC' + upc[i],
            price: Number(isCoupon) > 0 && !onsale[i]
                ? Number(Number(price[i] * (1 - coupon / 100)).toFixed(2))
                : Number(Number(price[i]).toFixed(2)),
            outofstock: outofstock,
            quantity: quantity[i],
            imgurl: imgurl[i],
            onsale: onsale[i],
        });
    }
    const transformedData = urlProduct.reduce((acc, { upc, onsale, ...rest }) => {
        acc[upc] = rest;
        return acc;
    }, {});
    let todayupdate = new Todayupdate({ products: transformedData, url: url });
    await todayupdate.save();
    var filterData;
    if (Array.isArray(datas)) {
        filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => p.upc === data['Input UPC']);
            if (matchedProduct) {
                return {
                    account: account,
                    'Product link': data['Product link'],
                    'Current Quantity': matchedProduct.quantity,
                    'Product price': data['Product price'],
                    'Current Price': matchedProduct.price,
                    'Image link': matchedProduct.imgurl,
                    'Input UPC': matchedProduct.upc,
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                    Brand: brand,
                    outofstock: matchedProduct?.outofstock ? matchedProduct.outofstock : ''
                };
            }
            return null;
        }).filter(item => item !== null);
    } else {
        filterData = []
    }
    let saved = await AutoFetchData.insertMany(filterData);
    if (Array.isArray(saved) && saved.length > 0) {
        let resp = await InvProduct.deleteMany({ account: account, 'Product link': url })
    }
    // -----------save out of stock data------
    filterData = filterData.filter((f) => f['Current Quantity'] == 0);
    if (Array.isArray(filterData) && filterData.length > 0) {
        let ooslist = []
        for (let i of filterData) {
            let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
            if (!isexist) {
                ooslist.push(i)
            }
        }
        await Outofstock.insertMany(ooslist)
    }

};

async function belk(url, account) {
    const client = new ZenRows(apikey);
    let request = await client.get(url, {
        premium_proxy: true,
        js_render: true,
    });
    // ------handle if url doesn't exist
    if (request.status == 410) {

        request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });

        if (request.status == 410) {
            let productlist = []
            let products = await InvProduct.find({ 'Product link': url })
            for (let data of products) {
                productlist.push({
                    account: account,
                    'Product link': url,
                    'Current Quantity': 0,
                    'Product price': data['Product price'],
                    'Current Price': 0,
                    'Image link': '',
                    'Input UPC': data['Input UPC'],
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                    remark: 'Product url not exist',
                    vendor: 'belk'
                })
            }
            await AutoFetchData.insertMany(productlist);
            await InvProduct.deleteMany({ account: account, 'Product link': url })
            return 'notexist';
        }
    }
    var html = await request.text();
    var utagData = await belk_productData(html, 'utag_data');

    if (!utagData) {
        await delay(5000);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        html = await request.text();
        utagData = await belk_productData(html, 'utag_data');
    }
    return { utagData, html }
}

async function handleoutofstock(utagData, url, account,) {
    if (utagData.sku_inventory.length == 0) {
        let oosdata = await InvProduct.find({ 'Product link': url })


        let oosproduct = await Promise.all(oosdata.map(async (data) => {
            let savedoos = await Outofstock.findOne({ 'Input UPC': data['Input UPC'] });
            return {
                account: account,
                'Product link': url,
                'Current Quantity': 0,
                'Product price': data['Product price'],
                'Current Price': 0,
                'Image link': '',
                'Input UPC': data['Input UPC'],
                'Fulfillment': data['Fulfillment'],
                'Amazon Fees%': data['Amazon Fees%'],
                'Amazon link': data['Amazon link'],
                'Shipping Template': data['Shipping Template'],
                'Min Profit': data['Min Profit'],
                ASIN: data.ASIN,
                SKU: data.SKU,
                outofstock: savedoos?.Date || ''
            };
        }));

        await AutoFetchData.insertMany(oosproduct);
        // ----------save product in today update-----
        let todayupdate = new Todayupdate({ url: url, products: null });
        await todayupdate.save()
        // ---------------save out of stock product in outofstock model ------------
        let ooslist = []
        for (let i of oosproduct) {
            let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
            if (!isexist) {
                ooslist.push(i)
            }
        }
        await Outofstock.insertMany(ooslist)
        let deleted = await InvProduct.deleteMany({ account: account, 'Product link': url })
        return true
    }
    if (Array.isArray(utagData?.sku_inventory) && utagData?.sku_inventory.length === 1 && utagData?.sku_inventory[0] === '0') {
        let oosdata = await InvProduct.find({ 'Product link': url })
        await InvProduct.deleteMany({ account: account, 'Product link': url });
        const oosproduct = oosdata.map(async (data) => {
            let savedoos = await Outofstock.findOne({ 'Input UPC': data['Input UPC'] })
            return {
                account: account,
                'Product link': url,
                'Current Quantity': 0,
                'Product price': data['Product price'],
                'Current Price': 0,
                'Image link': '',
                'Input UPC': data['Input UPC'],
                'Fulfillment': data['Fulfillment'],
                'Amazon Fees%': data['Amazon Fees%'],
                'Amazon link': data['Amazon link'],
                'Shipping Template': data['Shipping Template'],
                'Min Profit': data['Min Profit'],
                ASIN: data.ASIN,
                SKU: data.SKU,
                outofstock: savedoos?.Date ? savedoos.Date : ''
            }
        })
        await AutoFetchData.insertMany(oosproduct);
        let todayupdate = new Todayupdate({ url: url, products: null });
        await todayupdate.save()
        let ooslist = []
        for (let i of oosproduct) {
            let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
            if (!isexist) {
                ooslist.push(i)
            }
        }
        await Outofstock.insertMany(ooslist)
        await InvProduct.deleteMany({ account: account, 'Product link': url })
        return true;
    }
}

const countDays = (date) => {
    let [d1, m1, y1] = date.split('/').map(Number); // Parse input date (DD/MM/YYYY)

    let today = new Date();
    let d2 = today.getDate();
    let m2 = today.getMonth() + 1; // Months are 0-based, so add 1
    let y2 = today.getFullYear();

    let date1 = new Date(y1, m1 - 1, d1);
    let date2 = new Date(y2, m2 - 1, d2);

    let diff = Math.abs(date2 - date1); // Difference in milliseconds
    return Math.floor(diff / (1000 * 60 * 60 * 24)); // Convert to days
};

async function academy(url, account) {
    console.log(url)
    const client = new ZenRows(apikey);
    let request = await client.get(url, {
        premium_proxy: true,
        js_render: true,
    });
    // ------handle if url doesn't exist
    if (request.status == 410) {
        request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });

        if (request.status == 410) {
            let productlist = []
            let products = await InvProduct.find({ 'Product link': url })
            for (let data of products) {
                productlist.push({
                    account: account,
                    'Product link': url,
                    'Current Quantity': 0,
                    'Product price': data['Product price'],
                    'Current Price': 0,
                    'Image link': '',
                    'Input UPC': data['Input UPC'],
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                    remark: 'Product url not exist',
                    vendor: 'academy'
                })
            }
            await AutoFetchData.insertMany(productlist);
            await InvProduct.deleteMany({ account: account, 'Product link': url })
            return 'notexist';
        }
    }
    var html = await request.text();
    let productData = await academy_extractProductData(html, url, account)
}

async function academy_extractProductData(html, url, account) {
    let key = 'comp-blt51a442da3d780eaa'
    const pattern = new RegExp(`window\\.ASOData\\[['"]${key}['"]\\]\\s*=\\s*{`);
    const startMatch = html.match(pattern);

    if (!startMatch) {
        console.log('Key not found');
        return null;
    }

    const startIndex = html.indexOf(startMatch[0]);
    let i = html.indexOf('{', startIndex);
    let braceCount = 0;
    let endIndex = i;

    while (i < html.length) {
        if (html[i] === '{') braceCount++;
        else if (html[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIndex = i + 1;
            break;
        }
        i++;
    }

    const objectString = html.slice(html.indexOf('{', startIndex), endIndex);

    try {
        let productData = JSON.parse(objectString);
        let productArr = productData['api']['product-info']['productinfo']['sKUs']
        let inventoryArr = productData['api']['inventory']['online']

        const inventoryMap = inventoryArr.reduce((acc, i) => {
            if (i?.skuId) {
                acc[i.skuId] = i.availableQuantity ?? 0;
            }
            return acc;
        }, {});


        productArr = productArr.map((p) => ({
            account: account,
            upc: p?.descriptiveAttributes.UPCcode[0],
            price: p?.price.salePrice,
            size: p?.descriptiveAttributes.Size,
            color: p?.descriptiveAttributes.Color,
            img: p?.imageURL,
            itemId: p?.skuId,
            title: p.name,
            quantity: inventoryMap[p?.skuId] || 0,
            vendor: 'academy',
            url: url,
            Brand: p['facet_Brands']
        }))
        console.log(productArr)
        return productArr
    } catch (err) {
        console.error('JSON parsing error:', err.message);
        return null;
    }
}

// -------------walmart inventory updation--------
// async function walmart(url, account) {
//     // url = 'https://www.walmart.com/search?q=5253261159'
//     console.log(url, account)
//     let url = url;
//     url= url.split('/')[5]
//     url = 'https://www.walmart.com/search?q='+url
//     if (url) {
//         let browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
//         console.log(url)
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
//         const html = await page.content();
//         console.log('html receive')
//         const $ = cheerio.load(html);
//         await page.close()
//         const nextDataScript = $('script#__NEXT_DATA__').html()?.trim();
//         const jsonData = JSON.parse(nextDataScript);
//         const data = jsonData?.props?.pageProps?.initialData?.searchResult?.itemStacks[0]?.items
//         if (!data) {
//             console.log('Product data not found')
//             return false
//         }
//         let products = await InvProduct.findOne({ 'Product link': url })
//         // -------handle out of stock products---
//         if (Array.isArray(data) && data.length == 0) {
//             let oosp = await Outofstock.findOne({ 'Product link': url })
//             let updatedproduct = {
//                 account: account,
//                 'Product link': url,
//                 'Current Quantity': 10,
//                 'Product price': products['Product price'] || 0,
//                 'Current Price': 0,
//                 'Input UPC': products['Input UPC'] || '',
//                 'Fulfillment': products['Fulfillment'] || '',
//                 'Amazon Fees%': products['Amazon Fees%'] || '',
//                 'Amazon link': products['Amazon link'],
//                 'Shipping Template': products['Shipping Template'] || '',
//                 'Min Profit': products['Min Profit'] || '',
//                 ASIN: products.ASIN,
//                 SKU: products.SKU,
//                 Brand: products['Brand Name'],
//                 outofstock: oosp?.Data || ''
//             }
//             let saveProduct = await new AutoFetchData(updatedproduct).save()

//             if (!oosp) {
//                 let oosproduct = { ...updatedproduct, outofstock: new Date().toLocaleDateString("en-GB") }
//                 await new Outofstock(oosproduct).save()
//             }
//             return saveProduct ? true : false;
//         }
//         // --------handle if product is in stock---------
//         if (data) {
//             let groups = data[0].badges.groups
//             let priceinfo = data[0].priceInfo.linePrice
//             console.log(groups)
//             if (Array.isArray(data)) {
//                 let inventoryinfo = groups.find(g => g.name == 'urgency')
//                 console.log(products)
//                 if (inventoryinfo) {
//                     // -----handle low inventory----------
//                     let q = inventoryinfo.members[0].text.split(' ')[1]
//                     let updatedproduct = {
//                         account: account,
//                         'Product link': url,
//                         'Current Quantity': q,
//                         'Product price': products['Product price'] || 0,
//                         'Current Price': priceinfo || 0,
//                         'Input UPC': products['Input UPC'] || '',
//                         'Fulfillment': products['Fulfillment'] || '',
//                         'Amazon Fees%': products['Amazon Fees%'] || '',
//                         'Amazon link': products['Amazon link'],
//                         'Shipping Template': products['Shipping Template'] || '',
//                         'Min Profit': products['Min Profit'] || '',
//                         ASIN: products.ASIN,
//                         SKU: products.SKU,
//                         Brand: products['Brand Name'],
//                     }
//                     let saveProduct = await new AutoFetchData(updatedproduct).save()
//                     return saveProduct ? true : false

//                 } else {
//                     // -----------handle if product quantity if more than 10-
//                     let updatedproduct = {
//                         account: account,
//                         'Product link': url,
//                         'Current Quantity': 10,
//                         'Product price': products['Product price'] || 0,
//                         'Current Price': priceinfo || 0,
//                         'Input UPC': products['Input UPC'] || '',
//                         'Fulfillment': products['Fulfillment'] || '',
//                         'Amazon Fees%': products['Amazon Fees%'] || '',
//                         'Amazon link': products['Amazon link'],
//                         'Shipping Template': products['Shipping Template'] || '',
//                         'Min Profit': products['Min Profit'] || '',
//                         ASIN: products.ASIN,
//                         SKU: products.SKU,
//                         Brand: products['Brand Name'],
//                     }
//                     let saveProduct = await new AutoFetchData(updatedproduct).save()
//                     return saveProduct ? true : false
//                 }
//             }
//             return false
//         } else {
//             console.log('Product data not found')
//         }
//     } else {
//         return false;
//     }
// }


async function walmart(url, account) {
    let browser;
    try {
        if (!url) {
            console.error('Invalid URL structure');
            return false;
        }
        let originalUrl = url
        url = url + '?classType=VARIANT&adsRedirect=true'
        console.log('Received URL:', url, 'Account:', account);
        // // Connect to browser
        browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
        const page = await browser.newPage();

        // Load page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        const html = await page.content();
        const $ = cheerio.load(html);
        const nextDataScript = $('script#__NEXT_DATA__').html()?.trim();

        if (!nextDataScript) {
            console.error('NEXT_DATA script not found');
            return false;
        }
        const jsonData = JSON.parse(nextDataScript);
        const data = jsonData?.props?.pageProps?.initialData?.data
        const products = await InvProduct.findOne({ 'Product link': originalUrl });
        // ----------- Out of stock case ------------
        if (data == undefined) {
            console.log('Product appears to be out of stock');
            const oosp = await Outofstock.findOne({ 'Product link': url });
            const updatedProduct = {
                account,
                'Product link': url,
                'Current Quantity': 0,
                'Product price': products?.['Product price'] || 0,
                'Current Price': 0,
                'Input UPC': products?.['Input UPC'] || '',
                'Fulfillment': products?.['Fulfillment'] || '',
                'Amazon Fees%': products?.['Amazon Fees%'] || '',
                'Amazon link': products?.['Amazon link'],
                'Shipping Template': products?.['Shipping Template'] || '',
                'Min Profit': products?.['Min Profit'] || '',
                ASIN: products?.ASIN,
                SKU: products?.SKU,
                Brand: products?.['Brand Name'],
                outofstock: oosp?.Date || ''
            };

            const saveProduct = await new AutoFetchData(updatedProduct).save();
            await InvProduct.deleteOne({ 'Product link': originalUrl })
            if (!oosp) {
                const oosProduct = { ...updatedProduct, outofstock: new Date().toLocaleDateString("en-GB"), vendor: 'walmart' };
                await new Outofstock(oosProduct).save();
            }

            return !!saveProduct;
        }

        // ----------- In-stock case ------------
        const product = data?.product;
        const priceInfo = Number(product?.priceInfo?.currentPrice?.price || 0);


        let quantity = product?.fulfillmentOptions[0]?.availableQuantity

        const updatedProduct = {
            account,
            'Product link': url,
            'Current Quantity': quantity,
            'Product price': products?.['Product price'] || 0,
            'Current Price': priceInfo,
            'Input UPC': products?.['Input UPC'] || '',
            'Fulfillment': products?.['Fulfillment'] || '',
            'Amazon Fees%': products?.['Amazon Fees%'] || '',
            'Amazon link': products?.['Amazon link'],
            'Shipping Template': products?.['Shipping Template'] || '',
            'Min Profit': products?.['Min Profit'] || '',
            ASIN: products?.ASIN,
            SKU: products?.SKU,
            Brand: products?.['Brand Name'],
        };

        const saveProduct = await new AutoFetchData(updatedProduct).save();
        await InvProduct.deleteOne({ 'Product link': originalUrl })
        console.log('saved')
        return !!saveProduct;

    } catch (err) {
        console.error('Error in walmart():', err);
        return false;
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error('Error closing browser:', closeErr);
            }
        }
    }
}


module.exports = { academy, handleoutofstock, belk, saveData, boscovbrandscraper, boscov, fetchProductData, countDays, walmart }