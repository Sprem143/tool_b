const BrandPage = require('../../model/brandpage')

exports.academy = async (req, res) => {
    try {
        const { url, pages, account } = req.body
        let i = 2
        let pagesArr = []
        while (i <= pages) {
            pagesArr.push(url + `&page_${i}`)
            i += 1
        }
        console.log(pagesArr)
        let savedPages = new BrandPage({url:pagesArr, account:account})
         let resp=   await savedPages.save();
         console.log(resp)
    } catch (err) {
        cosnole.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}