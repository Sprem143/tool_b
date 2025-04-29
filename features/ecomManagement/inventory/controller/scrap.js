const {belk, handleoutofstock, saveData, boscov } = require('./util')


exports.thread1 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-1 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
              
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread2 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-2 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread3 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-3 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread4 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-4 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread5 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-5 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread6 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-6 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread7 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-7 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread8 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-8 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread9 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-9 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread10 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-10 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread11 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-11 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url,account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread12 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-12 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread13 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-13 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread14 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-14 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread15 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-15 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};
exports.thread16 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-16 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread17 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-17 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

exports.thread18 = async (req, res) => {
    try {
        let {url} = req.body;
        console.log(`Thread-18 : ${url}`)
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let {utagData, html}= await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url,account)
                    if (resp) return res.status(200).send(true);
                }
               await saveData(utagData, url,account,html);
                res.status(200).json({status:true});
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};


