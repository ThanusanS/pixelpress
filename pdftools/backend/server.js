/**
 * PixelPress PDF Tools — Backend API v3
 * Handles server-side operations that can't run in the browser:
 * - Format conversions (Word/Excel/PPT ↔ PDF) via LibreOffice
 * - OCR via Tesseract
 * - HTML→PDF via Puppeteer
 * - PDF encryption/decryption
 */

const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const sharp   = require('sharp');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024, files: 1000 } });

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '3.0.0' }));

// ── Image → PDF (JPG + PNG) ──────────────────────────────────────────────────
app.post('/api/jpg-to-pdf', upload.array('images', 1000), async (req, res) => {
  try {
    const pdf = await PDFDocument.create();
    for (const file of req.files) {
      const jpgBuf = await sharp(file.buffer).rotate().flatten({ background: '#fff' }).jpeg({ quality: 92 }).toBuffer();
      const img  = await pdf.embedJpg(jpgBuf);
      const { width, height } = img.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }
    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Merge PDFs ───────────────────────────────────────────────────────────────
app.post('/api/merge-pdf', upload.array('files', 100), async (req, res) => {
  try {
    const merged = await PDFDocument.create();
    for (const file of req.files) {
      const src   = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Compress PDF ─────────────────────────────────────────────────────────────
app.post('/api/compress-pdf', upload.single('file'), async (req, res) => {
  try {
    const src   = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const bytes = await src.save({ useObjectStreams: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Rotate PDF ────────────────────────────────────────────────────────────────
app.post('/api/rotate-pdf', upload.single('file'), async (req, res) => {
  try {
    const angle = parseInt(req.body.angle) || 90;
    const src   = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    src.getPages().forEach(p => p.setRotation(degrees(angle)));
    const bytes = await src.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Watermark PDF ─────────────────────────────────────────────────────────────
app.post('/api/watermark-pdf', upload.single('file'), async (req, res) => {
  try {
    const { text = 'CONFIDENTIAL', opacity = 0.3, color = '#ff0000' } = req.body;
    const src   = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const hex   = color.replace('#','');
    const r = parseInt(hex.slice(0,2),16)/255, g = parseInt(hex.slice(2,4),16)/255, b = parseInt(hex.slice(4,6),16)/255;
    src.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width/2 - (text.length * 18)/2, y: height/2,
        size: 48, rotate: degrees(45),
        color: rgb(r, g, b), opacity: parseFloat(opacity),
      });
    });
    const bytes = await src.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Split PDF ─────────────────────────────────────────────────────────────────
app.post('/api/split-pdf', upload.single('file'), async (req, res) => {
  try {
    const rangeStr = req.body.range || 'all';
    const src      = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const total    = src.getPageCount();
    let indices    = [];
    if (rangeStr === 'all') { indices = Array.from({length: total}, (_,i) => i); }
    else {
      rangeStr.split(',').forEach(part => {
        const [a, b] = part.trim().split('-').map(n => parseInt(n.trim()) - 1);
        if (b === undefined) { if (!isNaN(a) && a >= 0 && a < total) indices.push(a); }
        else { for (let i = a; i <= b && i < total; i++) if (i >= 0) indices.push(i); }
      });
    }
    const out    = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach(p => out.addPage(p));
    const bytes  = await out.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="split.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Page Numbers ──────────────────────────────────────────────────────────────
app.post('/api/page-numbers', upload.single('file'), async (req, res) => {
  try {
    const { position = 'bottom-center', startNum = 1 } = req.body;
    const src   = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    src.getPages().forEach((page, i) => {
      const { width, height } = page.getSize();
      const num = String(i + parseInt(startNum));
      const pos = {
        'bottom-center': { x: width/2 - 8, y: 20 },
        'bottom-right':  { x: width - 40,  y: 20 },
        'bottom-left':   { x: 20,           y: 20 },
        'top-center':    { x: width/2 - 8,  y: height - 30 },
        'top-right':     { x: width - 40,   y: height - 30 },
        'top-left':      { x: 20,           y: height - 30 },
      }[position] || { x: width/2 - 8, y: 20 };
      page.drawText(num, { ...pos, size: 12, color: rgb(0.4, 0.4, 0.4) });
    });
    const bytes = await src.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="numbered.pdf"');
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`✅ PixelPress API → http://localhost:${PORT}`));
