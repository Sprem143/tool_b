// server.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const BabyName = require('./model')
const exceljs = require('exceljs')
puppeteer.use(StealthPlugin());


exports.scrapeNames = async (req, res) => {
  try {
    const url = req.body.url;
    console.log('Scraping URL:', url);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('#babyName', { visible: true });
    await page.waitForSelector('#babyGender', { visible: true });
    await page.waitForSelector('#religion', { visible: true });

    // Fill form
    await page.select('#babyName', 'a');
    await page.select('#babyGender', 'boy');
    await page.select('#religion', 'hindu');

    await page.click('button[type="submit"]');

    await page.waitForSelector('#suggestionsList', { visible: true });

    let pageCount = 0;
    let totalSaved = 0;

    // Scrape all pages
    while (true) {
      pageCount++;

      // Scrape current page
      const namesOnPage = await page.evaluate(() => {
        const nameCards = Array.from(document.querySelectorAll('#suggestionsList .name-card'));
        return nameCards.map(card => ({
          name: card.querySelector('h4')?.innerText.trim() || '',
          meaning: card.querySelector('p:nth-of-type(1)')?.innerText.replace('Meaning :', '').trim() || '',
          religion: card.querySelector('p:nth-of-type(2)')?.innerText.replace('Religion :', '').trim() || '',
          gender: card.querySelector('p:nth-of-type(3)')?.innerText.replace('Gender :', '').trim() || '',
          number: card.querySelector('p:nth-of-type(4)')?.innerText.replace('Number :', '').trim() || '',
        }));
      });

      if (namesOnPage.length > 0) {
        await BabyName.insertMany(namesOnPage);
        totalSaved += namesOnPage.length;
        console.log(`✅ Page ${pageCount}: Saved ${namesOnPage.length} names (Total Saved: ${totalSaved})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.log(`⚠️ Page ${pageCount}: No names found.`);
      }

      // Check if Next button exists and is active
      const nextButtonVisible = await page.$eval('#nextBtn', btn => {
        return btn && !btn.disabled && btn.style.display !== 'none';
      }).catch(() => false);

      if (!nextButtonVisible) {
        console.log('🚀 No more pages. Scraping finished.');
        break;
      }

      // Click Next and wait for loading
      await Promise.all([
        page.click('#nextBtn'),
        new Promise(resolve => setTimeout(resolve, 1500)), // manually wait 1.5 sec
        page.waitForSelector('#suggestionsList', { visible: true }),
      ]);

    }

    await browser.close();

    res.json({ success: true, pagesScraped: pageCount, totalSaved, message: 'Scraping and saving completed!' });

  } catch (error) {
    console.error('Error scraping:', error);
    res.status(500).json({ success: false, message: 'Scraping failed', error: error.message });
  }

}


exports.downloadExcel = async (req, res) => {
  try {
    const savedData = await BabyName.find(); 
    if (savedData.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    // Create a new workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Names Data');

    // Add headers to the Excel sheet
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Meaning', key: 'meaning', width: 30 },
      { header: 'Religion', key: 'religion', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Number', key: 'number', width: 10 },
    ];

    // Add rows to the Excel sheet
    savedData.forEach((data) => {
      worksheet.addRow({
        name: data.name,
        meaning: data.meaning,
        religion: data.religion,
        gender: data.gender,
        number: data.number,
      });
    });

    // Set the response header for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="names_data.xlsx"'
    );

    // Write the file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).json({ message: 'Error generating Excel file', error });
  }
}

