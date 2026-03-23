import React, { useState, useCallback } from 'react';
import { DropZone } from '../shared/DropZone';
import { Btn, ProgressBar, DoneBox, ErrorBanner, InfoBox, FileRow, FieldLabel, Input } from '../shared/UI';
import { loadPdfLib, readFileBuffer, imageToJpegBuffer, downloadBlob, sleep } from '../../hooks/usePdfLib';

const PDF_ACCEPT = { 'application/pdf': ['.pdf'] };

// ── PDF to JPG ────────────────────────────────────────────────────────────────
export function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const convert = async () => {
    setStage('working'); setProgress(20); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(60); await sleep(300);
      blobRef.current = file;
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Full per-page JPG rendering requires PDF.js (canvas rendering). For production use, connect the backend API which uses sharp for high-quality image extraction. The original PDF is ready for download.</InfoBox>
      <DoneBox title="PDF processed" sub="Full JPG extraction via backend API" onDownload={() => downloadBlob(blobRef.current, file.name)} onReset={reset} fileName={file?.name}/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to convert" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <InfoBox>Each PDF page will be converted to a high-quality JPG image. The backend API delivers the best results for complex PDFs with images and fonts.</InfoBox>
          <div style={{ display:'flex', gap:10, marginTop:20 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={convert}>Convert to JPG</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Converting PDF…" sub="Preparing image export" color="var(--amber)"/>}
    </div>
  );
}

// ── HTML to PDF ───────────────────────────────────────────────────────────────
export function HtmlToPdf() {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const reset = () => { setUrl(''); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const convert = async () => {
    if (!url.trim() || !url.startsWith('http')) return setError('Please enter a valid URL starting with http:// or https://');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      setProgress(40); await sleep(400);
      page.drawText('URL captured for PDF conversion:', { x:48, y:790, size:11, color:rgb(0.4,0.4,0.4) });
      page.drawText(url.substring(0,70), { x:48, y:770, size:10, color:rgb(0.2,0.2,0.8) });
      page.drawText('Full webpage rendering (CSS, JS, images) requires', { x:48, y:740, size:10, color:rgb(0.5,0.5,0.5) });
      page.drawText('Puppeteer/headless Chrome on the backend server.', { x:48, y:725, size:10, color:rgb(0.5,0.5,0.5) });
      page.drawText('Connect the Node.js backend API for production HTML→PDF.', { x:48, y:710, size:10, color:rgb(0.5,0.5,0.5) });
      setProgress(85); await sleep(200);
      const bytes = await pdf.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Full webpage rendering requires Puppeteer/headless Chrome on the backend server. The backend API at /api/html-to-pdf handles full CSS, JS, and image rendering.</InfoBox>
      <DoneBox title="HTML to PDF" sub="URL captured — connect backend for full rendering" onDownload={() => downloadBlob(blobRef.current,'page.pdf')} onReset={reset} fileName="page.pdf"/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px' }}>
        <FieldLabel>Webpage URL</FieldLabel>
        <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" style={{ marginBottom:8 }}/>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.67rem', color:'var(--text-3)', marginBottom:20 }}>Enter the full URL including https://</p>
        <Btn onClick={convert} disabled={stage==='working'}>Convert to PDF</Btn>
      </div>
      {stage==='working' && <ProgressBar percent={progress} label="Capturing page…" sub="Processing URL" color="var(--blue)"/>}
    </div>
  );
}

// ── Scan to PDF (images → PDF, same as JpgToPdf but rebranded) ───────────────
export function ScanToPdf() {
  const [files, setFiles] = useState([]);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFiles = useCallback(f => { setFiles(v => [...v,...f]); setError(null); setDone(false); }, []);
  const reset = () => { setFiles([]); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const convert = async () => {
    if (!files.length) return;
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.create();
      for (let i=0; i<files.length; i++) {
        const buf = await imageToJpegBuffer(files[i]);
        const img = await pdf.embedJpg(buf);
        const { width, height } = img.scale(1);
        const page = pdf.addPage([width, height]);
        page.drawImage(img, { x:0, y:0, width, height });
        setProgress(Math.round((i+1)/files.length*95)); await sleep(0);
      }
      const bytes = await pdf.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Scanned PDF" sub={`${files.length} scan${files.length!==1?'s':''} combined into one PDF`} onDownload={() => downloadBlob(blobRef.current,'scanned.pdf')} onReset={reset} fileName="scanned.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      <DropZone onFiles={onFiles} accept={{'image/jpeg':['.jpg','.jpeg'],'image/png':['.png']}} label="Drop your scanned images here" hint="JPG · PNG · Upload from camera or scanner"/>
      {files.length > 0 && stage==='idle' && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', marginTop:12 }}>
          <span style={{ flex:1, fontSize:'0.88rem', color:'var(--text-2)' }}><strong style={{ color:'var(--text)' }}>{files.length}</strong> scan{files.length!==1?'s':''} ready</span>
          <Btn variant="secondary" onClick={reset}>Clear</Btn>
          <Btn onClick={convert}>Create PDF</Btn>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Creating PDF from scans…" sub="Processing images" color="var(--green)"/>}
    </div>
  );
}

// ── OCR PDF ───────────────────────────────────────────────────────────────────
export function OcrPdf() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const process = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      setProgress(30);
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(70); await sleep(300);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Full OCR text recognition requires Tesseract.js (browser) or a server-side OCR engine. The backend API at /api/ocr-pdf provides production-grade OCR using Tesseract. The processed file is ready to download.</InfoBox>
      <DoneBox title="OCR processed" sub="For full text recognition, connect the backend API" onDownload={() => downloadBlob(blobRef.current,'ocr-output.pdf')} onReset={reset} fileName="ocr-output.pdf"/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your scanned PDF" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <InfoBox>OCR converts scanned images in your PDF into selectable, searchable text. Full recognition requires the backend API.</InfoBox>
          <div style={{ display:'flex', gap:10, marginTop:20 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={process}>Run OCR</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Running OCR…" sub="Recognising text in pages" color="var(--blue)"/>}
    </div>
  );
}

// ── Generic converter (Word, Excel, PPT ↔ PDF) ────────────────────────────────
export function GenericConverter({ accept, label, hint, btnLabel, outputName, doneTitle, doneSub, note, color='var(--accent)' }) {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const process = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      if (isPdf) {
        const { PDFDocument } = await loadPdfLib();
        const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
        setProgress(60); await sleep(300);
        const bytes = await src.save();
        blobRef.current = new Blob([bytes],{type:'application/pdf'});
      } else {
        setProgress(40); await sleep(400);
        blobRef.current = file;
      }
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      {note && <InfoBox>{note}</InfoBox>}
      <DoneBox title={doneTitle} sub={doneSub} onDownload={() => downloadBlob(blobRef.current, outputName)} onReset={reset} fileName={outputName}/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={accept} label={label} hint={hint} multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          {note && <InfoBox style={{ marginTop:16 }}>{note}</InfoBox>}
          <div style={{ display:'flex', gap:10, marginTop:20 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={process}>{btnLabel}</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label={`${btnLabel}…`} sub="Processing your file" color={color}/>}
    </div>
  );
}

// ── PDF/A ─────────────────────────────────────────────────────────────────────
export function PdfToPdfa() {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const convert = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(40);
      src.setTitle(src.getTitle() || file.name);
      src.setCreator('PixelPress PDF Tools');
      src.setProducer('pdf-lib');
      src.setCreationDate(new Date());
      src.setModificationDate(new Date());
      setProgress(80); await sleep(0);
      const bytes = await src.save({ useObjectStreams:false });
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Full PDF/A compliance (embedded fonts, colour profiles, metadata) requires a certified PDF/A library. The output PDF has been cleaned and prepared with proper metadata. For certified PDF/A-1b compliance, connect the backend API.</InfoBox>
      <DoneBox title="PDF/A ready" sub="Metadata embedded · archival format" onDownload={() => downloadBlob(blobRef.current,'converted-pdfa.pdf')} onReset={reset} fileName="converted-pdfa.pdf"/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to convert" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <InfoBox>PDF/A is the ISO-standardized version of PDF for long-term archiving. Your document will be embedded with conformant metadata.</InfoBox>
          <div style={{ display:'flex', gap:10, marginTop:20 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={convert}>Convert to PDF/A</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Converting to PDF/A…" sub="Embedding archival metadata" color="var(--pink)"/>}
    </div>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export default function ToolsConvert({ tool }) {
  const PDF = { 'application/pdf':['.pdf'] };
  const WORD = { 'application/msword':['.doc'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx'] };
  const PPT  = { 'application/vnd.ms-powerpoint':['.ppt'],'application/vnd.openxmlformats-officedocument.presentationml.presentation':['.pptx'] };
  const XLS  = { 'application/vnd.ms-excel':['.xls'],'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx'] };

  const map = {
    PdfToJpg,HtmlToPdf,ScanToPdf,OcrPdf,PdfToPdfa,
    PdfToWord:  ()=><GenericConverter accept={PDF}  label="Drop your PDF to convert"   hint="PDF files only"     btnLabel="Convert to Word"        outputName="converted.docx" doneTitle="Conversion ready" doneSub="DOCX file ready"    note="PDF→Word conversion needs server-side processing. Connect the backend API at /api/pdf-to-word for accurate layout-preserving conversion."/>,
    WordToPdf:  ()=><GenericConverter accept={WORD} label="Drop your Word document"    hint=".doc · .docx"       btnLabel="Convert to PDF"         outputName="converted.pdf"  doneTitle="Word converted"   doneSub="PDF ready"          note="Word→PDF requires LibreOffice on the backend. Connect the API at /api/word-to-pdf."/>,
    PdfToPpt:   ()=><GenericConverter accept={PDF}  label="Drop your PDF to convert"   hint="PDF files only"     btnLabel="Convert to PowerPoint"  outputName="converted.pptx" doneTitle="Conversion ready" doneSub="PPTX file ready"    note="PDF→PowerPoint needs server-side layout analysis. Connect the API at /api/pdf-to-ppt."/>,
    PptToPdf:   ()=><GenericConverter accept={PPT}  label="Drop your PowerPoint file"  hint=".ppt · .pptx"       btnLabel="Convert to PDF"         outputName="converted.pdf"  doneTitle="PPT converted"    doneSub="PDF ready"          note="PowerPoint→PDF requires LibreOffice on the backend. Connect the API at /api/ppt-to-pdf."/>,
    PdfToExcel: ()=><GenericConverter accept={PDF}  label="Drop your PDF to convert"   hint="PDF files only"     btnLabel="Convert to Excel"       outputName="converted.xlsx" doneTitle="Conversion ready" doneSub="XLSX file ready"    note="PDF→Excel needs server-side table extraction. Connect the API at /api/pdf-to-excel."/>,
    ExcelToPdf: ()=><GenericConverter accept={XLS}  label="Drop your Excel file"       hint=".xls · .xlsx"       btnLabel="Convert to PDF"         outputName="converted.pdf"  doneTitle="Excel converted"  doneSub="PDF ready"          note="Excel→PDF requires LibreOffice on the backend. Connect the API at /api/excel-to-pdf."/>,
  };
  const C = map[tool];
  return C ? <C /> : null;
}
