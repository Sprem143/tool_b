const { google } = require("googleapis");
const InvProduct = require("../../features/ecomManagement/inventory/model/invProduct");
const Backup = require("../../features/ecomManagement/inventory/model/backup");
const AutoFetchData = require('../../features/ecomManagement/inventory/model/autofetchdata')
require('dotenv').config();
const local = 'http://localhost:10000'
// const api = 'https://tool-b.onrender.com'
const api = 'https://brand-b-1.onrender.com'
const f_api = 'http://localhost:5173'
const f_link = 'https://tool2-0.vercel.app'


exports.auth = async (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: "Missing client credentials" });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${api}/api/google/callback`
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    state: JSON.stringify({ clientId, clientSecret }),
  });
  res.json({ url });
};

exports.callback = async (req, res) => {
  const { code, state } = req.query;

  if (!state) return res.status(400).json({ error: "Missing state" });

  const { clientId, clientSecret } = JSON.parse(state);

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${api}/api/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const redirectTokens = {
      tokens,
      clientId,
      clientSecret
    };

    res.redirect(
      `${f_link}/google-sheet?tokens=${encodeURIComponent(JSON.stringify(redirectTokens))}`
    );
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    res.status(500).send("Authentication failed");
  }
};

// Backup Helper
async function saveBackup(account) {
  await Backup.deleteMany({ account });
  const batchSize = 10000;
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const query = lastId ? { _id: { $gt: lastId }, account } : { account };
    const batch = await AutoFetchData.find(query)
      .sort({ _id: 1 })
      .limit(batchSize);

    if (batch.length === 0) break;

    const backupfile = batch.map(({ _doc }) => ({ ..._doc }));
    await Backup.insertMany(backupfile);
    lastId = batch[batch.length - 1]._id;
  }

  await AutoFetchData.deleteMany({ account });
}

// Sheet Route - fetch data
exports.sheet = async (req, res) => {
  let { sheetdetails } = req.body
  let token = JSON.parse(sheetdetails.token)
  token = token.tokens
  let range = sheetdetails.range
  let start = 2;
  let c_end;

  if (range.includes('-')) {
    let [s, e] = range.split('-')
    start = Number(s)
    c_end = Number(e)
  }
  const oauth2Client = new google.auth.OAuth2(
    sheetdetails.clientId,
    sheetdetails.clientSecret,
    `${api}/api/google/callback`
  );

  oauth2Client.setCredentials(token);
  const isExpired = token.expiry_date && token.expiry_date <= Date.now();

  if (isExpired && token.refresh_token) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      token = credentials;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return res.status(401).json({ status: false, message: "Token refresh failed" });
    }
  }

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  const sheet_id = sheetdetails.sheeturl.split('/')[5];
  let sheetdata = [];

  try {
    const sheetRange = c_end ? c_end : Number(sheetdetails.range) + 1;
    const batchSize = 10000;

    console.log('verified')
    if (isNaN(sheetRange)) {
      console.error("Invalid sheet range:", sheetdetails.range);
      return res.status(400).json({ status: false, message: "Invalid range format" });
    }
    while (start <= sheetRange) {
      let end = Math.min(start + batchSize - 1, sheetRange);
      console.log(start, end)
      let response;
      response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheet_id,
        range: `${sheetdetails.sheetname}!A${start}:AD${end}`,
      });
      // }
      let data;

      data = (response.data.values || []).filter((f) => f[8] !== undefined || null ||'');

      const datasheet = data.map((f) => ({
        account: sheetdetails.account, 
        vendor: f[3].toLowerCase(),
        'Input UPC': f[9],
        ASIN: f[10],
        SKU: f[2],
        'Product price': f[16],
        'Product link': f[6]?.split('.html')[0] + '.html',
        Fulfillment: f[18],
        'Amazon Fees%': f[30] || '17%',
        'Shipping Template': f[22],
        'Min Profit': f[28],
        'Brand Name': f[7],
        'Amazon Title': f[5]
      }));
      if (datasheet.length > 0) {
        await InvProduct.insertMany(datasheet);
        sheetdata.push(datasheet)
        console.log(`Inserted ${sheetdata.length} records.`);
      }
      start = end + 1;
    }

    let belk = await InvProduct.countDocuments({ account: sheetdetails.account, vendor: 'belk' })
    let boscov = await InvProduct.countDocuments({ account: sheetdetails.account, vendor: 'boscovs' })
    let data = [{ vendor: 'Belk', num: belk }, { vendor: 'Boscovs', num: boscov }]
    res.status(200).json({ status: true, data: sheetdata, sheet: sheetdetails.sheetname, updated: data });

  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch sheet" });
  }
};

