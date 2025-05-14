const BrandPage = require('../../model/brandpage')

exports.academy = async (req, res) => {
    try {
        const { url, num, brandname, account } = req.body
        let i = 2
        let pagesArr = []
        while (i <= num) {
            pagesArr.push(url + `&page_${i}`)
            i += 1
        }
        
        for (let i of pagesArr){
            
        }

        let savedPages = new BrandPage({ url: pagesArr, account: account, vendor: 'academy' })
        let resp = await savedPages.save();
        console.log(resp)
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}