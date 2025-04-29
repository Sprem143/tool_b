const InvProduct = require('../model/invProduct')
const Todayupdate = require('../model/todayupdate')
const Rcube = require('../model/rcube')
const Bijak = require('../model/bijak')
const Om = require('../model/om')
const Zenith = require('../model/zenith')
const AutoFetchData = require('../model/autofetchdata')
const Backup = require('../model/backup')
const ExcelJS = require("exceljs");


async function insertInChunks(model, data, chunkSize = 1000) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await model.insertMany(chunk);
  }
}

exports.saveproduct = async (req, res) => {
  try {

  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }
}

exports.getproductlink = async (req, res) => {
  try {
    const { account } = req.body
    let rawData = await InvProduct.find({ account: account }, { 'Product link': 1, _id: 0 });
    let data = rawData.map(item => item['Product link']);
    data = [...new Set(data)]
    let synced = await AutoFetchData.countDocuments({ account: account })
    let backup = await Backup.countDocuments({ account: account })
    const firstDoc = await Backup.findOne({}, { createdAt: 1, _id: 0 }).sort({ createdAt: 1 });
    let date
    if (firstDoc) {
      date = new Date(firstDoc?.createdAt) || ''
      date = date.toLocaleString() || ''
    }

    res.status(200).json({ status: true, data: data, synced: synced, backup, date })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }
}

exports.getinventorycard = async (req, res) => {
  try {
    const { account } = req.body
    let date = new Date().toLocaleDateString("en-GB")

    let oosmt30 = 0
    let total = 0
    let uploaded = await InvProduct.countDocuments({ account: account });
    let synced = await AutoFetchData.countDocuments({ Date: date, account: account });
    let urlnotexist = await AutoFetchData.countDocuments({ account: account, outofstock: "Product url doesn't exist" })
    let outofstock = await AutoFetchData.countDocuments({
      account: account,
      'Available Quantity': { $lt: 2 }
    });

    account == 'rcube' ? total = await Rcube.countDocuments() : null
    account == 'bijak' ? total = await Bijak.countDocuments() : null
    account == 'zenith' ? total = await Zenith.countDocuments() : null
    account == 'om' ? total = await Om.countDocuments() : null


    let data = [
      { id: 1, title: "Uploaded Data", description: uploaded, img: "/static/todayentry.png", sub: 'Total uploaded product' },
      { id: 2, title: "Synced Urls", description: synced, img: "/static/untrackable.png", sub: `${synced} products synced` },
      { id: 3, title: "Url un-available", description: urlnotexist, img: "/static/pdf.png", sub: `${urlnotexist} products of ${account} not exit on vendor` },
      { id: 4, title: "All products", description: total, img: "/static/unshipped.png", sub: `total Products listed in your account` },
      { id: 5, title: "Out of stock", description: outofstock, img: "/static/return.png", sub: 'Out of stock product from current inventory' },
      { id: 6, title: "Need to remove", description: oosmt30, img: "/static/deadline.png", sub: 'These products out of stock from more than 30 days' },
    ]
    res.status(200).json({ status: true, card: data })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }
}

// ---------download synced inventory file --

exports.downloadSyncedProduct = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Synced Product");

    // Add header row
    worksheet.columns = [
      { header: "Input UPC", key: "Input UPC", width: 20 },
      { header: "ASIN", key: "ASIN", width: 15 },
      { header: "SKU", key: "SKU", width: 30 },
      { header: "Product price", key: "Product price", width: 10 },
      { header: "Product Link", key: "Product link", width: 40 },
      { header: "Fulfillment", key: "Fulfillment", width: 10 },
      { header: "Amazon Fees %", key: "Amazon Fees %", width: 10 },
      { header: "Shipping Template", key: "Shipping Template", width: 10 },
      { header: "Min Profit", key: "Min Profit", width: 10 },
      { header: "Current Price", key: "Current Price", width: 10 },
      { header: "Current Quantity", key: "Current Quantity", width: 10 },
      { header: "Price Range", key: "Price Range", width: 10 },
      { header: "Out of Stock", key: "out of stock", width: 10 },
      { header: "remark", key: "remark", width: 10 },
    ];


    const cursor = AutoFetchData.find().cursor(); // MongoDB cursor

    for await (const doc of cursor) {
      worksheet.addRow({
        'Input UPC': doc['Input UPC'],
        ASIN: doc.ASIN,
        SKU: doc.SKU,
        'Product price': doc['Product price'],
        'Product link': doc['Product link'],
        Fulfillment: doc.Fulfillment,
        "Amazon Fees %": doc['Amazon Fees%'],
        "Shipping Template": doc['Shipping Template'],
        "Min Profit": doc["Min Profit"],
        "Current Price": doc["Current Price"],
        "Current Quantity": doc["Current Quantity"],
        "Price Range": doc["Price Range"],
        "out of stock": doc["out of stock"],
        remark :doc["remark"]
      });
    }

    ["Current Price", "Current Quantity"].forEach((key) => {
      worksheet.getColumn(key).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF2CC" }, // Light yellow
        };
      });
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");

    await workbook.xlsx.write(res); // stream directly to response
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).send("Something went wrong while exporting.");
  }
}

exports.downloadBackup = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Backup");

    // Add header row
    worksheet.columns = [
      { header: "Input UPC", key: "Input UPC", width: 20 },
      { header: "ASIN", key: "ASIN", width: 15 },
      { header: "SKU", key: "SKU", width: 30 },
      { header: "Product price", key: "Product price", width: 10 },
      { header: "Product Link", key: "Product link", width: 40 },
      { header: "Fulfillment", key: "Fulfillment", width: 10 },
      { header: "Amazon Fees %", key: "Amazon Fees %", width: 10 },
      { header: "Shipping Template", key: "Shipping Template", width: 10 },
      { header: "Min Profit", key: "Min Profit", width: 10 },
      { header: "Current Price", key: "Current Price", width: 10 },
      { header: "Current Quantity", key: "Current Quantity", width: 10 },
      { header: "Price Range", key: "Price Range", width: 10 },
      { header: "Out of Stock", key: "out of stock", width: 10 },
    ];


    const cursor = Backup.find().cursor(); // MongoDB cursor

    for await (const doc of cursor) {
      worksheet.addRow({
        'Input UPC': doc['Input UPC'],
        ASIN: doc.ASIN,
        SKU: doc.SKU,
        'Product price': doc['Product price'],
        'Product link': doc['Product link'],
        Fulfillment: doc.Fulfillment,
        "Amazon Fees %": doc['Amazon Fees%'],
        "Shipping Template": doc['Shipping Template'],
        "Min Profit": doc["Min Profit"],
        "Current Price": doc["Current Price"],
        "Current Quantity": doc["Current Quantity"],
        "Price Range": doc["Price Range"],
        "out of stock": doc["out of stock"],
      });
    }

    ["Current Price", "Current Quantity"].forEach((key) => {
      worksheet.getColumn(key).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF2CC" }, // Light yellow
        };
      });
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");

    await workbook.xlsx.write(res); // stream directly to response
    res.end();
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).send("Something went wrong while exporting.");
  }
}

exports.alreadysavedproduct = async (req, res) => {
  try {
    let { account } = req.body
    let belk = await InvProduct.countDocuments({ account: account, vendor: 'belk' })
    let boscov = await InvProduct.countDocuments({ account: account, vendor: 'boscovs' })
    let total = await AutoFetchData.countDocuments({ account: account })
    let data = [{ vendor: 'Belk', num: belk }, { vendor: 'Boscovs', num: boscov }, {vendor:'Old Synced', num: total }]
    res.status(200).json({ status: true, data: data })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }
}

exports.deleteinventory = async (req, res) => {
  try {
    const { vendor, account } = req.body
    let resp = await InvProduct.deleteMany({ vendor: vendor, account: account })
    let belk = await InvProduct.countDocuments({ account: account, vendor: 'belk' })
    let boscov = await InvProduct.countDocuments({ account: account, vendor: 'boscovs' })
    let total = await AutoFetchData.countDocuments({ account: account })
    let data = [{ vendor: 'Belk', num: belk }, { vendor: 'Boscovs', num: boscov },  {vendor:'Old Synced', num: total }]
    res.status(200).json({ status: true, data: data, msg: `${resp.deletedCount} products deleted` })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }
}

exports.deletesynced = async (req, res) => {
  try {
    let account = req.body.account
    let resp = await AutoFetchData.deleteMany({ account: account })
    let belk = await InvProduct.countDocuments({ account: account, vendor: 'belk' })
    let boscov = await InvProduct.countDocuments({ account: account, vendor: 'boscovs' })
    let total = await AutoFetchData.countDocuments({ account: account })
    let data = [{ vendor: 'Belk', num: belk }, { vendor: 'Boscovs', num: boscov },  {vendor:'Old Synced', num: total }]
    res.status(200).json({ status: true, data: data, msg: `${resp.deletedCount} Synced Products deleted` })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: false, msg: err })
  }

}

