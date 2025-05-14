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


const checkifbrandalreadyscrap = async (brandname, vendor) => {
    let brandwords = brandname?.split(' ').filter(Boolean);
    brandwords = brandwords.map(word => word.toLowerCase());

    let listedbrand = await Scrappedbrand.find({ vendor: vendor }, { brandurl: 1, _id: 0 });
    console.log(listedbrand)
    listedbrand = listedbrand.map(b => b.brandurl);
    for (let i of listedbrand) {
        let urlToCheck = i.toLowerCase();
        let allWordsMatch = brandwords.every(word => urlToCheck.includes(word));
        if (allWordsMatch) {
            return urlToCheck;
        }
    }
}

const generateurl = async (num, url, account) => {
    if (url.includes('prefn1')) {
        let a = url.split('?');
        let b = a[1].split('&')
        let l = a[0] + '?' + b[1] + '&' + b[2] + '&' + b[0]

        let n1 = 60;
        let urls = parseInt(num / 60) - 1;
        let index = 0;
        let urllist = [];
        while (index <= urls) {
            urllist.push(l + `&start=${n1}&sz=60`);
            n1 = n1 + 60;
            index++
        }
        if (urllist.length > 0) {
            const pages = new BrandPage({ url: urllist, account: account, vendor: 'belk' });
            await pages.save();
            return true;
        } else {
            return false
        }
    }
}

async function insertInChunks(modelName, documents) {
    const chunkSize = 5000;
    if (modelName == 'ProductBackup') {
        for (let i = 0; i < documents.length; i += chunkSize) {
            const chunk = documents.slice(i, i + chunkSize);
            try {
                let res = await ProductBackup.insertMany(chunk, { ordered: false });
            } catch (err) {
                console.error(`Error inserting documents ${i} to ${i + chunk.length - 1}:`, err);
            }
        }
    }


}

async function scrapfirstpage(url) {
    let response = await axios({
        url: 'https://api.zenrows.com/v1/',
        method: 'GET',
        params: {
            'url': url,
            'apikey': apikey,
            'js_render': true,
            'premium_proxy': true
        },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let productUrls = [];
    $('a.thumb-link').each((index, element) => {
        const url = $(element).attr('href');
        if (url) {
            productUrls.push(url);
        }
    });
    productUrls = [...new Set(productUrls)]
    return productUrls
}

const handleSecondPageScraping = async (urls) => {
    let i;
    for (i = 0; i < urls.length;) {
        const url = urls[i]
        let response = await axios({
            url: 'https://api.zenrows.com/v1/',
            method: 'GET',
            params: {
                'url': url,
                'apikey': apikey,
                'js_render': true,
                'premium_proxy': true
            },
        });

        const html = response.data;
        const $ = cheerio.load(html);
        let productUrls = [];
        $('a.thumb-link').each((index, element) => {
            let url = $(element).attr('href');
            url ? productUrls.push(url) : null
        });

        if (productUrls.length > 0) {
            const productarr = productUrls.map(p => 'https://www.belk.com' + p);
            let prevarr = await BrandUrl.find();
            let newarrlist = [...prevarr[0].producturl, ...productarr];
            newarrlist = [...new Set(newarrlist)]
            let arrid = prevarr[0]._id
            const r = await BrandUrl.findByIdAndUpdate(
                { _id: arrid },
                { $set: { producturl: newarrlist } },
                { new: true }
            )
            r?.producturl?.length > 0 ? i++ : i
        }
    }
    if (i == urls.length) {
        return true
    } else return false
};
// --------blk brand scrapping---------

async function fetchAndExtractVariable(html, variableName) {
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

const getupc = async (url, account) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        let clrsize = await fetchProductData(html);
        const size = clrsize.colorSizeMap.colorToSize
        const color = clrsize.colorSizeMap.colors;
        let id_color = Object.fromEntries(Object.entries(color).map(([key, value]) => [key, value.name]))
        let id_size = Object.fromEntries(
            Object.entries(size).map(([outerKey, innerObj]) => [
                outerKey,
                Object.fromEntries(
                    Object.entries(innerObj).map(([key, value]) => [value, key.split('_')[1]])
                )
            ])
        );

        var color_size = {};
        for (const [productId, sizes] of Object.entries(id_size)) {
            const color = id_color[productId];
            for (const [upc, size] of Object.entries(sizes)) {
                color_size[upc] = { size, color };
            }
        }

        const data = await fetchAndExtractVariable(html, 'utag_data');
        if (data && color_size) {
            let prefix = account == 'rcube' ? 'RC-R1' : account == 'om' ? 'OM-O1' : account == 'bijak' ? 'BJ-S1' : account == 'zenith' ? ZL - L1 : 'AB-C1'

            const name = data.product_name[0];
            const upc = data.sku_upc;
            const id = data.sku_id;
            const price = data.sku_price;
            const num = data.sku_inventory;
            const onsale = data.sku_on_sale;
            const imgurl = data.sku_image_url;
            const Brand = data.product_brand[0];
            const belkTitle = data.product_name[0];
            const coupon = data.product_promotedCoupon[0].cpnDiscount !== undefined ? data.product_promotedCoupon[0].cpnDiscount : null;
            let products = upc.map((u, index) => ({
                account: account,
                 vendor:'belk',
                name: name,
                upc: u,
                price: Number(data.product_promotedCoupon[0].cpnDiscount) > 0 && Boolean(onsale[index]) === false ? price[index] * (1 - (coupon / 100)) : price[index],
                quantity: Number(num[index]),
                productid: id[index],
                color: color_size[id[index]] ? color_size[id[index]].color : null,
                size: color_size[id[index]] ? color_size[id[index]].size : null,
                sku: generatesku(u, prefix, color_size[id[index]] ? color_size[id[index]].color : null, color_size[id[index]] ? color_size[id[index]].size : null, 'belk'),
                url: url,
                imgurl: imgurl[index],
                Brand: Brand,
                belkTitle: belkTitle,
               
            }));
            // ---------removing out of stock products----------
            const filterProduct = products.filter((p) => p.quantity > 2);
            let saveProducts = await Product.insertMany(filterProduct)
                .catch(err => console.error("Error saving products:", err));
            if (saveProducts) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                return 1;
            }
        } else {
            return 0;
        }
    } catch (err) {
        console.error("Error in getupc:", err);
        return 0;
    }
};

const calculateshippingcost = (title) => {
    if (title) {
        const collection = {
            'Shoes': 14, 'Shoe': 14, 'Sandal': 13, 'Sandals': 13, 'Booties': 16, 'Boot': 16, 'Boots': 16, 'Clog': 14, 'Clogs': 14,
            'Slippers': 13, 'Slipper': 13, 'Loafer': 14, 'Loafers': 14, 'Sneaker': 14, 'Sneakers': 14, 'T-Shirt': 11.5, 'T-Shirts': 11.5,
            'Jeans': 13, 'Jean': 13, 'Shorts': 11.5, 'Short': 11.5, 'Shirts': 11.5, 'Shirt': 11.5, 'Pants': 11.5, 'Pant': 11.5,
            'Hoodie': 15, 'Pullover': 15, 'Sweatshirt': 13, 'Sweatshirts': 13, 'Jacket': 15, 'Jackets': 15, 'Blazer': 21,
            'Blazers': 21, 'Kurta': 11.5, 'Legging': 11.5, 'Kurti': 11.5, 'Bra': 10.5, 'Panty': 10.5, 'Panties': 10.5, 'Underwear': 10.5, 'Brief': 10.5, 'Briefs': 10.5,
            'Hipster': 10.5, 'Cardigan': 11.5, 'Neck Top': 11.5, 'Tank Top': 11.5, 'Skirt': 11.5, 'Open Front': 11.5, 'Peasant Top': 11.5,
            'Scoop Neck': 11.5, 'Flat': 13
        }

        const normalizedTitle = title.trim().toLowerCase();
        for (const [key, price] of Object.entries(collection)) {
            if (normalizedTitle.includes(key.toLowerCase())) {
                return price; // Return the price if a match is found
            }
        }
        return 0;
    } else {
        return 0
    }
}

// ----------------boscov -----------------
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

const boscovbrandscraper = async (url, account) => {
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

            let prefix = account == 'rcube' ? 'RC-R2' : account == 'om' ? 'OM-O2' : account == 'bijak' ? 'BJ-S7' : account == 'zenith' ? ZL - L3 : 'AB-C1'

            let products = productData.variations.map((p) => ({
                account: account,
                upc: p.upc,
                price: price,
                sku: generatesku(p.upc, prefix, p.options[0]?.value, p.options[1]?.value, 'boscovs'),
                pricerange: arr,
                quantity: p.inventoryInfo.onlineStockAvailable,
                color: p.options[0]?.value,
                size: p.options[1]?.value,
                imgurl: img,
                url: url,
                vendor:'boscovs'
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
module.exports = { calculateshippingcost, boscovbrandscraper, checkifbrandalreadyscrap, getupc, generateurl, insertInChunks, scrapfirstpage, handleSecondPageScraping }