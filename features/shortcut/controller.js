
const fs = require('fs');
const path = require('path');
const { PDFDocument, degrees } = require('pdf-lib');
const archiver = require('archiver');



exports.rotatePdfs = async (req, res) => {
    console.log("rotate pdf")
    const files = req.files;
    const angle = parseInt(req.body.angle) || 90;

    const outputDir = 'output/';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    for (const file of files) {
        const existingPdfBytes = fs.readFileSync(file.path);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
pages.forEach(page => {
  const currentRotation = page.getRotation().angle;
  page.setRotation(degrees(currentRotation + angle));
});
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(path.join(outputDir, file.originalname), pdfBytes);

        fs.unlinkSync(file.path); // clean up
    }

    // ZIP all files
    const archive = archiver('zip');
    const zipName = 'rotated_pdfs.zip';
    const output = fs.createWriteStream(zipName);

    output.on('close', () => {
        res.download(zipName, () => {
            fs.unlinkSync(zipName);
            fs.readdirSync(outputDir).forEach(f => fs.unlinkSync(path.join(outputDir, f)));
        });
    });

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();
};

