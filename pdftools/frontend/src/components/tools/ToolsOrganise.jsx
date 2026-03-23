import React, { useState, useCallback } from 'react';
import { DropZone } from '../shared/DropZone';
import { Btn, ProgressBar, DoneBox, ErrorBanner, InfoBox, FileRow, FieldLabel, Input, Select } from '../shared/UI';
import { loadPdfLib, readFileBuffer, imageToJpegBuffer, downloadBlob, sleep } from '../../hooks/usePdfLib';

const PDF_ACCEPT = { 'application/pdf': ['.pdf'] };
const IMG_ACCEPT = { 'image/jpeg':['.jpg','.jpeg'], 'image/png':['.png'] };
const BATCH = 15;

// ─────────────────────────────────────────────────────────────────────────────
// JPG / PNG → PDF
// ─────────────────────────────────────────────────────────────────────────────
export function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFiles = useCallback(incoming => {
    const valid = incoming.filter(f => ['image/jpeg','image/jpg','image/png'].includes(f.type.toLowerCase()));
    const skipped = incoming.length - valid.length;
    if (skipped) setError(`${skipped} file(s) skipped — only JPG/PNG accepted.`);
    setFiles(v => [...v, ...valid]);
    setPreviews(v => [...v, ...valid.map(f => URL.createObjectURL(f))]);
    setDone(false);
  }, []);

  const removeFile = i => {
    URL.revokeObjectURL(previews[i]);
    setFiles(v => v.filter((_,j)=>j!==i));
    setPreviews(v => v.filter((_,j)=>j!==i));
  };

  const reset = () => {
    previews.forEach(URL.revokeObjectURL);
    setFiles([]); setPreviews([]); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current = null;
  };

  const convert = async () => {
    if (!files.length) return;
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.create();
      for (let i = 0; i < files.length; i += BATCH) {
        const batch = files.slice(i, i+BATCH);
        const bufs = await Promise.allSettled(batch.map(f => imageToJpegBuffer(f)));
        for (const r of bufs) {
          if (r.status !== 'fulfilled') continue;
          try {
            const img = await pdf.embedJpg(r.value);
            const { width, height } = img.scale(1);
            const page = pdf.addPage([width, height]);
            page.drawImage(img, { x:0, y:0, width, height });
          } catch(e) { console.warn('embed skip', e.message); }
        }
        setProgress(Math.round(Math.min((i+BATCH)/files.length*100, 100)));
        await sleep(0);
      }
      const bytes = await pdf.save();
      blobRef.current = new Blob([bytes], { type:'application/pdf' });
      setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Your PDF is" sub={`${files.length} image${files.length!==1?'s':''} merged · built entirely in your browser`} onDownload={() => downloadBlob(blobRef.current,'converted.pdf')} onReset={reset} fileName="converted.pdf"/>;

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {stage !== 'working' && <DropZone onFiles={onFiles} accept={IMG_ACCEPT} label="Drop JPG or PNG images here" hint="JPG · PNG · Up to 1,000 files · 50 MB each"/>}
      {files.length > 0 && stage === 'idle' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:6, margin:'16px 0', padding:10, background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' }}>
            {previews.slice(0,72).map((src,i) => (
              <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:'var(--r-sm)', overflow:'hidden', border:'1px solid var(--border)', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.querySelector('.rm')?.style && (e.currentTarget.querySelector('.rm').style.opacity='1')}
                onMouseLeave={e => e.currentTarget.querySelector('.rm')?.style && (e.currentTarget.querySelector('.rm').style.opacity='0')}>
                <span style={{ position:'absolute', top:4, left:4, background:'rgba(0,0,0,.75)', color:'#fff', fontFamily:'var(--font-mono)', fontSize:'0.52rem', padding:'1px 5px', borderRadius:3, zIndex:2 }}>{i+1}</span>
                <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} loading="lazy"/>
                <button className="rm" onClick={() => removeFile(i)} style={{ position:'absolute', top:3, right:3, width:18, height:18, borderRadius:'50%', background:'rgba(239,68,68,.9)', border:'none', color:'#fff', fontSize:'0.65rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3, opacity:0, transition:'opacity var(--t)' }}>✕</button>
              </div>
            ))}
            {previews.length > 72 && <div style={{ aspectRatio:'1', borderRadius:'var(--r-sm)', border:'1.5px dashed var(--border-md)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, color:'var(--text-3)', fontFamily:'var(--font)' }}><span style={{ fontWeight:700, fontSize:'1rem' }}>+{previews.length-72}</span><span style={{ fontSize:'0.6rem', fontFamily:'var(--font-mono)' }}>more</span></div>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' }}>
            <span style={{ flex:1, fontSize:'0.88rem', color:'var(--text-2)' }}><strong style={{ color:'var(--text)' }}>{files.length}</strong> image{files.length!==1?'s':''} queued · in page order</span>
            <Btn variant="secondary" onClick={reset}>Clear all</Btn>
            <Btn onClick={convert}>Generate PDF</Btn>
          </div>
        </>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Building your PDF…" sub="Processing images in your browser — no upload needed" color="var(--accent-2)"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE PDF
// ─────────────────────────────────────────────────────────────────────────────
export function MergePdf() {
  const [files, setFiles] = useState([]);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFiles = useCallback(f => { setFiles(v => [...v, ...f]); setError(null); setDone(false); }, []);
  const remove = i => setFiles(v => v.filter((_,j)=>j!==i));
  const moveUp = i => { if(i===0) return; const a=[...files]; [a[i-1],a[i]]=[a[i],a[i-1]]; setFiles(a); };
  const moveDown = i => { if(i===files.length-1) return; const a=[...files]; [a[i],a[i+1]]=[a[i+1],a[i]]; setFiles(a); };
  const reset = () => { setFiles([]); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const merge = async () => {
    if (files.length < 2) return setError('Please add at least 2 PDF files to merge.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const buf = await readFileBuffer(files[i]);
        let src;
        try { src = await PDFDocument.load(buf, { ignoreEncryption:true }); }
        catch { setError(`Could not read "${files[i].name}". File may be corrupt.`); setStage('idle'); return; }
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
        setProgress(Math.round((i+1)/files.length*95));
        await sleep(0);
      }
      const bytes = await merged.save();
      blobRef.current = new Blob([bytes], { type:'application/pdf' });
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Merged PDF" sub={`${files.length} PDFs combined into one document`} onDownload={() => downloadBlob(blobRef.current,'merged.pdf')} onReset={reset} fileName="merged.pdf"/>;

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {stage !== 'working' && <DropZone onFiles={onFiles} accept={PDF_ACCEPT} label="Drop PDF files to merge" hint="PDF files only · drag handles to reorder after upload"/>}
      {files.length > 0 && stage === 'idle' && (
        <>
          <div style={{ margin:'16px 0', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--bg-2)' }}>
            {files.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:i<files.length-1?'1px solid var(--border)':'none' }}>
                <span style={{ background:'var(--bg-4)', borderRadius:4, width:24, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)', flexShrink:0 }}>{i+1}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}><path d="M2 1.5h7l3 3v9H2z" stroke="var(--accent-3)" strokeWidth="1.2" fill="none" strokeLinejoin="round"/><path d="M9 1.5v3h3" stroke="var(--accent-3)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{ flex:1, fontSize:'0.84rem', color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)', flexShrink:0 }}>{(f.size/1024).toFixed(0)} KB</span>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  {[['↑',()=>moveUp(i)],['↓',()=>moveDown(i)]].map(([lbl,fn]) => (
                    <button key={lbl} onClick={fn} style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:4, color:'var(--text-3)', cursor:'pointer', width:22, height:22, fontSize:'0.75rem', transition:'all var(--t)' }} onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-4)';e.currentTarget.style.color='var(--text-2)'}} onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-3)';e.currentTarget.style.color='var(--text-3)'}}>{lbl}</button>
                  ))}
                  <button onClick={() => remove(i)} style={{ background:'var(--red-bg)', border:'1px solid rgba(239,68,68,.2)', borderRadius:4, color:'var(--red)', cursor:'pointer', width:22, height:22, fontSize:'0.75rem' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="secondary" onClick={reset}>Clear all</Btn>
            <Btn onClick={merge}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 4h4v8H3zM7 6h4v6H7zM5 12h4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              Merge {files.length} PDFs
            </Btn>
          </div>
        </>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Merging PDFs…" sub={`Combining ${files.length} documents in your browser`} color="var(--accent-2)"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT PDF
// ─────────────────────────────────────────────────────────────────────────────
export function SplitPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('all');
  const [range, setRange] = useState('');
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(async files => {
    const f = files[0]; if (!f) return;
    setFile(f); setError(null); setDone(false);
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.load(await readFileBuffer(f), { ignoreEncryption:true });
      setPageCount(doc.getPageCount());
    } catch { setError('Cannot read this PDF. It may be corrupt.'); }
  }, []);

  const reset = () => { setFile(null); setPageCount(0); setRange(''); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const parseRange = (str, total) => {
    const indices = [];
    str.split(',').forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(n => parseInt(n.trim()) - 1);
        for (let i = Math.max(0,a); i <= Math.min(b,total-1); i++) indices.push(i);
      } else {
        const n = parseInt(trimmed) - 1;
        if (!isNaN(n) && n >= 0 && n < total) indices.push(n);
      }
    });
    return [...new Set(indices)].sort((a,b)=>a-b);
  };

  const split = async () => {
    setStage('working'); setError(null); setProgress(10);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const total = src.getPageCount();
      const indices = mode === 'all' ? Array.from({length:total},(_,i)=>i) : parseRange(range, total);
      if (!indices.length) { setError('No valid pages in the specified range.'); setStage('idle'); return; }
      const out = await PDFDocument.create();
      setProgress(40);
      const copied = await out.copyPages(src, indices);
      copied.forEach(p => out.addPage(p));
      setProgress(85); await sleep(0);
      const bytes = await out.save();
      blobRef.current = new Blob([bytes], { type:'application/pdf' });
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Split PDF" sub={`Extracted ${mode==='all'?pageCount:parseRange(range,pageCount).length} page(s)`} onDownload={() => downloadBlob(blobRef.current,'split.pdf')} onReset={reset} fileName="split.pdf"/>;

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage === 'idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--accent-3)', marginBottom:20 }}>{pageCount} pages detected</p>
          <FieldLabel>Extract pages</FieldLabel>
          <div style={{ display:'flex', gap:8, marginBottom:18 }}>
            {[['all','All pages'],['range','Custom range']].map(([m,lbl]) => (
              <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:'10px 16px', borderRadius:'var(--r-md)', border:`1px solid ${mode===m?'var(--accent-2)':'var(--border)'}`, background:mode===m?'var(--accent-bg)':'var(--bg-3)', color:mode===m?'var(--accent-3)':'var(--text-2)', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.85rem', fontWeight:mode===m?600:400, transition:'all var(--t)' }}>{lbl}</button>
            ))}
          </div>
          {mode === 'range' && (
            <div style={{ marginBottom:20 }}>
              <FieldLabel>Page range (e.g. 1,3,5-8)</FieldLabel>
              <Input value={range} onChange={e => setRange(e.target.value)} placeholder={`e.g. 1-3,5,7-${pageCount}`}/>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.67rem', color:'var(--text-3)', marginTop:6 }}>Separate pages with commas. Use hyphens for ranges.</p>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="secondary" onClick={reset}>Change file</Btn>
            <Btn onClick={split}>Split PDF</Btn>
          </div>
        </div>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Splitting PDF…" sub="Extracting selected pages" color="var(--green)"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPRESS PDF
// ─────────────────────────────────────────────────────────────────────────────
export function CompressPdf() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(70);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState(null);
  const blobRef = React.useRef(null);

  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); setStats(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); setStats(null); blobRef.current=null; };

  const compress = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      setProgress(25);
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(60); await sleep(0);
      const bytes = await src.save({ useObjectStreams: quality < 50 });
      setProgress(95); await sleep(50);
      const blob = new Blob([bytes], { type:'application/pdf' });
      blobRef.current = blob;
      setStats({ original:file.size, compressed:blob.size });
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  const saved = stats ? Math.max(0, Math.round((1 - stats.compressed/stats.original)*100)) : 0;

  if (done) return (
    <>
      <div style={{ display:'flex', gap:1, borderRadius:'var(--r-lg)', overflow:'hidden', border:'1px solid var(--border)', marginBottom:16 }}>
        {[{l:'Original',v:`${(stats.original/1024).toFixed(0)} KB`},{l:'Compressed',v:`${(stats.compressed/1024).toFixed(0)} KB`},{l:'Space saved',v:`${saved}%`,hi:true}].map((s,i)=>(
          <div key={i} style={{ flex:1, padding:'16px 14px', background:'var(--bg-2)', borderRight:i<2?'1px solid var(--border)':'none', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.15rem', color:s.hi?'var(--green)':'var(--text)', letterSpacing:'-0.02em', marginBottom:3 }}>{s.v}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <DoneBox title="Compressed PDF" sub={`Reduced by ${saved}% · ready to download`} onDownload={() => downloadBlob(blobRef.current,'compressed.pdf')} onReset={reset} fileName="compressed.pdf"/>
    </>
  );

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage === 'idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ margin:'20px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <FieldLabel>Compression strength</FieldLabel>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color: quality < 40 ? 'var(--green)' : quality < 70 ? 'var(--amber)' : 'var(--text-3)' }}>
                {quality < 40 ? 'Maximum compression' : quality < 70 ? 'Balanced' : 'Light compression'}
              </span>
            </div>
            <input type="range" min="10" max="100" step="5" value={quality} onChange={e => setQuality(+e.target.value)} style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)' }}>
              <span>Smaller file</span><span>Better quality</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="secondary" onClick={reset}>Change file</Btn>
            <Btn onClick={compress}>Compress PDF</Btn>
          </div>
        </div>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Compressing PDF…" sub="Optimising file structure" color="var(--orange)"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROTATE PDF
// ─────────────────────────────────────────────────────────────────────────────
export function RotatePdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState(90);
  const [target, setTarget] = useState('all');
  const [pages, setPages] = useState('');
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(async files => {
    const f = files[0]; if (!f) return;
    setFile(f); setError(null); setDone(false);
    const { PDFDocument } = await loadPdfLib();
    const doc = await PDFDocument.load(await readFileBuffer(f), { ignoreEncryption:true });
    setPageCount(doc.getPageCount());
  }, []);

  const reset = () => { setFile(null); setPageCount(0); setPages(''); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const rotate = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(30);
      const allPages = src.getPages();
      let indices = [];
      if (target === 'all') { indices = allPages.map((_,i)=>i); }
      else {
        pages.split(',').forEach(part => {
          const t = part.trim();
          if (t.includes('-')) { const [a,b]=t.split('-').map(n=>parseInt(n)-1); for(let i=Math.max(0,a);i<=Math.min(b,allPages.length-1);i++) indices.push(i); }
          else { const n=parseInt(t)-1; if(!isNaN(n)&&n>=0&&n<allPages.length) indices.push(n); }
        });
      }
      indices.forEach(i => allPages[i].setRotation(degrees(angle)));
      setProgress(80); await sleep(0);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes], { type:'application/pdf' });
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Rotated PDF" sub={`Pages rotated by ${angle}°`} onDownload={() => downloadBlob(blobRef.current,'rotated.pdf')} onReset={reset} fileName="rotated.pdf"/>;

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage === 'idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--accent-3)', marginBottom:20 }}>{pageCount} pages</p>
          <FieldLabel>Rotation angle</FieldLabel>
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            {[90,180,270].map(a => (
              <button key={a} onClick={() => setAngle(a)} style={{ flex:1, padding:'14px', borderRadius:'var(--r-md)', border:`1px solid ${angle===a?'var(--accent-2)':'var(--border)'}`, background:angle===a?'var(--accent-bg)':'var(--bg-3)', color:angle===a?'var(--accent-3)':'var(--text-2)', cursor:'pointer', fontFamily:'var(--font)', fontWeight:700, fontSize:'1rem', transition:'all var(--t)' }}>
                {a === 90 ? '↻ 90°' : a === 180 ? '↻ 180°' : '↺ 270°'}
              </button>
            ))}
          </div>
          <FieldLabel>Apply to</FieldLabel>
          <div style={{ display:'flex', gap:8, marginBottom: target==='pages'?12:20 }}>
            {[['all','All pages'],['pages','Specific pages']].map(([m,lbl]) => (
              <button key={m} onClick={() => setTarget(m)} style={{ flex:1, padding:'10px', borderRadius:'var(--r-md)', border:`1px solid ${target===m?'var(--accent-2)':'var(--border)'}`, background:target===m?'var(--accent-bg)':'var(--bg-3)', color:target===m?'var(--accent-3)':'var(--text-2)', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.85rem', fontWeight:target===m?600:400, transition:'all var(--t)' }}>{lbl}</button>
            ))}
          </div>
          {target === 'pages' && (
            <div style={{ marginBottom:20 }}>
              <Input value={pages} onChange={e => setPages(e.target.value)} placeholder={`e.g. 1,3,5-8 (max ${pageCount})`}/>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="secondary" onClick={reset}>Change file</Btn>
            <Btn onClick={rotate}>Rotate PDF</Btn>
          </div>
        </div>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Rotating pages…" sub={`Applying ${angle}° rotation`} color="var(--green)"/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANISE PDF
// ─────────────────────────────────────────────────────────────────────────────
export function OrganisePdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const onFile = useCallback(async files => {
    const f = files[0]; if (!f) return;
    setFile(f); setError(null); setDone(false);
    const { PDFDocument } = await loadPdfLib();
    const doc = await PDFDocument.load(await readFileBuffer(f), { ignoreEncryption:true });
    setPages(Array.from({length:doc.getPageCount()},(_,i)=>({ idx:i, label:`Page ${i+1}` })));
  }, []);

  const reset = () => { setFile(null); setPages([]); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };
  const removePage = i => setPages(v => v.filter((_,j)=>j!==i));
  const moveUp   = i => { if(i===0) return; const a=[...pages]; [a[i-1],a[i]]=[a[i],a[i-1]]; setPages(a); };
  const moveDown = i => { if(i===pages.length-1) return; const a=[...pages]; [a[i],a[i+1]]=[a[i+1],a[i]]; setPages(a); };

  const apply = async () => {
    if (!pages.length) return setError('No pages left. Please add at least one page.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const out = await PDFDocument.create();
      setProgress(30);
      const copied = await out.copyPages(src, pages.map(p=>p.idx));
      copied.forEach(p => out.addPage(p));
      setProgress(80); await sleep(0);
      const bytes = await out.save();
      blobRef.current = new Blob([bytes], { type:'application/pdf' });
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Organised PDF" sub={`${pages.length} pages in your custom order`} onDownload={() => downloadBlob(blobRef.current,'organised.pdf')} onReset={reset} fileName="organised.pdf"/>;

  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage === 'idle' && pages.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontFamily:'var(--font)', fontSize:'0.88rem', color:'var(--text-2)' }}>{pages.length} pages · reorder or delete pages below</span>
            <Btn variant="secondary" onClick={reset} style={{ padding:'7px 14px', fontSize:'0.8rem' }}>Change file</Btn>
          </div>
          <div style={{ border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--bg-2)', marginBottom:16, maxHeight:420, overflowY:'auto' }}>
            {pages.map((p,i) => (
              <div key={`${p.idx}-${i}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:i<pages.length-1?'1px solid var(--border)':'none', transition:'background var(--t)' }}>
                <span style={{ background:'var(--bg-4)', borderRadius:4, width:28, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)', flexShrink:0 }}>{i+1}</span>
                <span style={{ flex:1, fontSize:'0.84rem', color:'var(--text-2)' }}>{p.label}</span>
                <div style={{ display:'flex', gap:4 }}>
                  {[['↑',()=>moveUp(i)],['↓',()=>moveDown(i)]].map(([lbl,fn])=>(
                    <button key={lbl} onClick={fn} style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:4, color:'var(--text-3)', cursor:'pointer', width:22, height:22, fontSize:'0.7rem' }}>{lbl}</button>
                  ))}
                  <button onClick={() => removePage(i)} style={{ background:'var(--red-bg)', border:'1px solid rgba(239,68,68,.2)', borderRadius:4, color:'var(--red)', cursor:'pointer', width:22, height:22, fontSize:'0.7rem' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <Btn onClick={apply}>Apply & Download</Btn>
        </div>
      )}
      {stage === 'working' && <ProgressBar percent={progress} label="Organising pages…" sub="Rebuilding PDF with new page order" color="var(--blue)"/>}
    </div>
  );
}

// ── Dispatcher — called from App.jsx with tool="ToolName" ────────────────────
export default function ToolsOrganise({ tool }) {
  const map = { JpgToPdf, MergePdf, SplitPdf, CompressPdf, RotatePdf, OrganisePdf };
  const C = map[tool];
  return C ? <C /> : null;
}
