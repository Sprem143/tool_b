
require('dotenv').config();
const BrandUrl = require('../../model/brandurl');
const { getupc, boscovbrandscraper } = require('./util')
const { walmartproductscraper } = require('../walmart/util')

exports.thread1 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account
        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }
        // ----------walmart scrappint--------
        else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread2 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }

            // ---------------handle walmart scraping-----------
        }
        else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread3 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account
        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread4 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread5 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread6 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
               
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread7 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};
exports.thread8 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread9 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread10 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread11 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread12 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread13 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread14 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread15 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread16 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread17 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};

exports.thread18 = async (req, res) => {
    try {
        const { url } = req.body;
        const account = req.body.account

        if (url.includes('https://www.boscovs.com')) {
            let ans = await boscovbrandscraper(url, account)
            if (ans) {
                await BrandUrl.updateOne(
                    { account: account },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        } else if (url.includes('https://www.walmart.com') || url.includes('/ip/')) {
            let ans = await walmartproductscraper(url, account)
            if (ans > 0) {
                await BrandUrl.updateOne(
                    { account: account, vendor: 'walmart' },
                    { $pull: { producturl: url } }
                )
                res.status(200).json({ status: true, msg: ans })
            } else {
                res.status(200).json({ status: false })
                console.log("UPC data not found or error occurred for:", url);
            }
        }

        else {
            let result = await getupc(url, account);
            result === 1 ? res.status(200).json({ status: true }) : res.status(200).json({ status: false })
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};


