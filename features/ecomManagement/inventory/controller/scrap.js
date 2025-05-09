const { belk, handleoutofstock, saveData, boscov, academy } = require('./util')


exports.thread1 = async (req, res) => {
    try {
        let { url } = req.body;
        const account = req.body.account
        //-----------------handle boscovs url------------
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })

            // --------handle belk url---------
        } else if (url.startsWith('https://www.belk.com')) {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
            }
        }

        // -------------handle academy url -------
        else if (url.startsWith('https://www.academy.com/')) {
            let resp = await academy(url, account)
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })
        } else {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
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
        let { url } = req.body;
        const account = req.body.account

        //-----------------handle boscovs url------------
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            let result = await boscov(url, account)
            result ? res.status(200).send(true) : res.status(500).json({ status: false, msg: "Internal server error" })

            // --------handle belk url---------
        } else if (url.startsWith('https://www.belk.com')) {
            let { utagData, html } = await belk(url, account)
            if (utagData == 'notexist') return res.json(200).send(true)
            else {
                if (
                    (Array.isArray(utagData.sku_inventory) && utagData.sku_inventory.length === 0) ||
                    (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0')
                ) {
                    let resp = handleoutofstock(utagData, url, account)
                    if (resp) return res.status(200).send(true);
                }
                await saveData(utagData, url, account, html);
                res.status(200).json({ status: true });
            }
        }

        // -------------handle academy url -------
        else if (url.startsWith('https://www.academy.com/')) {
            let resp = await academy(url, account)
        }


    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};


