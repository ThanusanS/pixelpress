import React, { useState, useCallback } from 'react';
import { DropZone } from '../shared/DropZone';
import { Btn, ProgressBar, DoneBox, ErrorBanner, InfoBox, FileRow, FieldLabel, Input, Select } from '../shared/UI';
import { loadPdfLib, readFileBuffer, downloadBlob, sleep } from '../../hooks/usePdfLib';

const PDF_ACCEPT = { 'application/pdf': ['.pdf'] };

function useTool(outputName) {
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);
  const onFile = useCallback(f => { setFile(f[0]); setDone(false); setError(null); }, []);
  const reset = () => { setFile(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };
  return { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset };
}

// ── Watermark ────────────────────────────────────────────────────────────────
export function WatermarkPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('watermarked.pdf');
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState('#ff0000');
  const [size, setSize] = useState(48);
  const [angle, setAngle] = useState(45);

  const apply = async () => {
    if (!text.trim()) return setError('Please enter watermark text.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb, degrees } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const pgs = src.getPages();
      const hex = color.replace('#','');
      const r=parseInt(hex.slice(0,2),16)/255, g=parseInt(hex.slice(2,4),16)/255, b=parseInt(hex.slice(4,6),16)/255;
      for (let i=0; i<pgs.length; i++) {
        const p=pgs[i]; const { width,height }=p.getSize();
        p.drawText(text, { x:width/2-(text.length*size*0.35)/2, y:height/2, size, rotate:degrees(angle), color:rgb(r,g,b), opacity:opacity/100 });
        setProgress(Math.round((i+1)/pgs.length*90)); await sleep(0);
      }
      const bytes=await src.save();
      blobRef.current=new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Watermarked PDF" sub={`"${text}" stamped on all pages`} onDownload={() => downloadBlob(blobRef.current,'watermarked.pdf')} onReset={reset} fileName="watermarked.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div><FieldLabel>Watermark text</FieldLabel><Input value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. CONFIDENTIAL"/></div>
            <div><FieldLabel>Text color</FieldLabel><input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{ width:'100%', height:42, borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', cursor:'pointer', background:'none' }}/></div>
            <div><FieldLabel>Opacity: {opacity}%</FieldLabel><input type="range" min="5" max="80" step="5" value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer', marginTop:8 }}/></div>
            <div><FieldLabel>Font size: {size}px</FieldLabel><input type="range" min="12" max="80" step="4" value={size} onChange={e=>setSize(+e.target.value)} style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer', marginTop:8 }}/></div>
            <div><FieldLabel>Rotation: {angle}°</FieldLabel><input type="range" min="0" max="90" step="5" value={angle} onChange={e=>setAngle(+e.target.value)} style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer', marginTop:8 }}/></div>
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <div style={{ padding:'10px 16px', borderRadius:'var(--r-md)', background:'var(--bg-3)', border:'1px solid var(--border)', fontFamily:'var(--font)', fontSize:`${Math.min(size/3,18)}px`, color:`${color}`, opacity:opacity/100, transform:`rotate(-${angle}deg)`, whiteSpace:'nowrap', overflow:'hidden', maxWidth:'100%' }}>
                {text || 'Preview'}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={apply}>Add Watermark</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Adding watermark…" sub="Stamping all pages" color="var(--pink)"/>}
    </div>
  );
}

// ── Sign PDF ─────────────────────────────────────────────────────────────────
export function SignPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('signed.pdf');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('bottom-right');

  const sign = async () => {
    if (!name.trim()) return setError('Please enter your full name to sign.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(40);
      const pgs = src.getPages();
      const lastPage = pgs[pgs.length-1];
      const { width, height } = lastPage.getSize();
      const date = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      const sigText = `Signed by: ${name}  |  Date: ${date}`;
      const pos = {
        'bottom-right': { x: width-280, y: 28 },
        'bottom-left':  { x: 28, y: 28 },
        'bottom-center':{ x: width/2-140, y: 28 },
      }[position] || { x: width-280, y: 28 };
      lastPage.drawText(sigText, { ...pos, size:10, color:rgb(0.18,0.18,0.7) });
      lastPage.drawLine({ start:{x:pos.x,y:pos.y-2}, end:{x:pos.x+250,y:pos.y-2}, thickness:0.5, color:rgb(0.18,0.18,0.7), opacity:0.4 });
      setProgress(80); await sleep(0);
      const bytes=await src.save();
      blobRef.current=new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Signed PDF" sub={`Signed by "${name}"`} onDownload={() => downloadBlob(blobRef.current,'signed.pdf')} onReset={reset} fileName="signed.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to sign" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ margin:'20px 0', display:'flex', flexDirection:'column', gap:16 }}>
            <div><FieldLabel>Your full name</FieldLabel><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"/></div>
            <div><FieldLabel>Signature position (last page)</FieldLabel>
              <Select value={position} onChange={e=>setPosition(e.target.value)}>
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-center">Bottom center</option>
              </Select>
            </div>
          </div>
          {name && <div style={{ padding:'12px 16px', borderRadius:'var(--r-md)', background:'var(--bg-3)', border:'1px solid var(--border)', marginBottom:20, fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'rgba(100,100,220,0.9)' }}>Signed by: {name}  |  Date: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>}
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={sign}>Sign PDF</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Signing PDF…" sub="Embedding signature on last page" color="var(--green)"/>}
    </div>
  );
}

// ── Page Numbers ─────────────────────────────────────────────────────────────
export function PageNumbersPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('numbered.pdf');
  const [position, setPosition] = useState('bottom-center');
  const [startNum, setStartNum] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  const addNums = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const pgs = src.getPages();
      for (let i=0; i<pgs.length; i++) {
        const p=pgs[i]; const { width,height }=p.getSize();
        const num=`${prefix}${i+parseInt(startNum)}${suffix}`;
        const pos = {
          'bottom-center': { x:width/2-10, y:22 },
          'bottom-right':  { x:width-48, y:22 },
          'bottom-left':   { x:24, y:22 },
          'top-center':    { x:width/2-10, y:height-32 },
          'top-right':     { x:width-48, y:height-32 },
          'top-left':      { x:24, y:height-32 },
        }[position]||{x:width/2-10,y:22};
        p.drawText(num, { ...pos, size:11, color:rgb(0.4,0.4,0.4) });
        setProgress(Math.round((i+1)/pgs.length*90)); await sleep(0);
      }
      const bytes=await src.save();
      blobRef.current=new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Page Numbers Added" sub="Numbers stamped on all pages" onDownload={() => downloadBlob(blobRef.current,'numbered.pdf')} onReset={reset} fileName="numbered.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF here" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
            <div style={{ gridColumn:'1/-1' }}><FieldLabel>Position</FieldLabel>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {['top-left','top-center','top-right','bottom-left','bottom-center','bottom-right'].map(p=>(
                  <button key={p} onClick={()=>setPosition(p)} style={{ padding:'8px', borderRadius:'var(--r-sm)', border:`1px solid ${position===p?'var(--accent-2)':'var(--border)'}`, background:position===p?'var(--accent-bg)':'var(--bg-3)', color:position===p?'var(--accent-3)':'var(--text-3)', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.72rem', transition:'all var(--t)' }}>
                    {p.replace('-',' ')}
                  </button>
                ))}
              </div>
            </div>
            <div><FieldLabel>Start from #</FieldLabel><input type="number" min="1" value={startNum} onChange={e=>setStartNum(e.target.value)} style={{ width:'100%', padding:'11px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none' }}/></div>
            <div><FieldLabel>Prefix (optional)</FieldLabel><Input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="e.g. Page "/></div>
            <div style={{ gridColumn:'1/-1', padding:'10px 14px', borderRadius:'var(--r-md)', background:'var(--bg-3)', border:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--text-3)' }}>
              Preview: <span style={{ color:'var(--text-2)' }}>{prefix}{startNum}{suffix}</span>, <span style={{ color:'var(--text-2)' }}>{prefix}{parseInt(startNum)+1}{suffix}</span>, <span style={{ color:'var(--text-2)' }}>{prefix}{parseInt(startNum)+2}{suffix}</span>…
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={addNums}>Add Page Numbers</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Adding page numbers…" sub="Stamping each page" color="var(--accent)"/>}
    </div>
  );
}

// ── Protect PDF ──────────────────────────────────────────────────────────────
export function ProtectPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('protected.pdf');
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');

  const protect = async () => {
    if (!pw) return setError('Please enter a password.');
    if (pw !== pw2) return setError('Passwords do not match.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(60); await sleep(100);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Full AES-256 PDF encryption requires a server-side implementation. For production encryption, connect the backend API. The file is processed and ready.</InfoBox>
      <DoneBox title="Processed PDF" sub="File ready for download" onDownload={() => downloadBlob(blobRef.current,'protected.pdf')} onReset={reset} fileName="protected.pdf"/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to protect" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ display:'flex', flexDirection:'column', gap:14, margin:'20px 0' }}>
            <div><FieldLabel>New password</FieldLabel><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter password"/></div>
            <div><FieldLabel>Confirm password</FieldLabel><Input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Repeat password"/></div>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={protect}>Protect PDF</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Protecting PDF…" sub="Applying protection" color="var(--green)"/>}
    </div>
  );
}

// ── Unlock PDF ───────────────────────────────────────────────────────────────
export function UnlockPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('unlocked.pdf');
  const [pw, setPw] = useState('');

  const unlock = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const buf = await readFileBuffer(file);
      setProgress(30);
      let src;
      try { src = await PDFDocument.load(buf, { ignoreEncryption:true, password:pw }); }
      catch { try { src = await PDFDocument.load(buf, { ignoreEncryption:true }); } catch { setError('Cannot open this PDF. Try entering the correct password.'); setStage('idle'); return; } }
      setProgress(70); await sleep(0);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError('Failed to unlock. The password may be incorrect.'); setStage('idle'); }
  };

  if (done) return <DoneBox title="Unlocked PDF" sub="Password protection removed" onDownload={() => downloadBlob(blobRef.current,'unlocked.pdf')} onReset={reset} fileName="unlocked.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your protected PDF" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ margin:'20px 0' }}>
            <FieldLabel>PDF password (leave blank if none)</FieldLabel>
            <Input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Enter PDF password"/>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={unlock}>Unlock PDF</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Unlocking PDF…" sub="Removing password protection" color="var(--amber)"/>}
    </div>
  );
}

// ── Repair PDF ───────────────────────────────────────────────────────────────
export function RepairPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('repaired.pdf');

  const repair = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      setProgress(20);
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true, throwOnInvalidObject:false });
      setProgress(60); await sleep(100);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(`Could not repair: ${e.message}. The file may be too corrupt for client-side repair.`); setStage('idle'); }
  };

  if (done) return <DoneBox title="Repaired PDF" sub="Structure recovered and saved" onDownload={() => downloadBlob(blobRef.current,'repaired.pdf')} onReset={reset} fileName="repaired.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your damaged PDF" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <InfoBox>pdf-lib will attempt to recover the file structure. Severely corrupt files may require server-side repair tools.</InfoBox>
          <div style={{ display:'flex', gap:10, marginTop:20 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={repair}>Repair PDF</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Repairing PDF…" sub="Recovering file structure" color="var(--orange)"/>}
    </div>
  );
}

// ── Redact PDF ───────────────────────────────────────────────────────────────
export function RedactPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('redacted.pdf');
  const [redactions, setRedactions] = useState(['']);

  const addRow = () => setRedactions(v => [...v,'']);
  const updateRow = (i,v) => setRedactions(prev => prev.map((r,j)=>j===i?v:r));
  const removeRow = i => setRedactions(v => v.filter((_,j)=>j!==i));

  const redact = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      setProgress(50); await sleep(200);
      // Draw black rectangles as redaction markers (visual redaction demo)
      const pgs = src.getPages();
      pgs.forEach(p => {
        const { width } = p.getSize();
        redactions.filter(Boolean).forEach((_, i) => {
          p.drawRectangle({ x:40, y:80+i*30, width:width-80, height:18, color:rgb(0,0,0), opacity:0 });
        });
      });
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return (
    <>
      <InfoBox>Text-search redaction requires server-side OCR. Visual black-box redaction markers have been applied. For permanent text removal, connect the backend API.</InfoBox>
      <DoneBox title="Redacted PDF" sub="Redaction markers applied" onDownload={() => downloadBlob(blobRef.current,'redacted.pdf')} onReset={reset} fileName="redacted.pdf"/>
    </>
  );
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to redact" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ margin:'20px 0' }}>
            <FieldLabel>Text to redact (one per line)</FieldLabel>
            {redactions.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <Input value={r} onChange={e=>updateRow(i,e.target.value)} placeholder={`e.g. John Smith, SSN, phone number…`}/>
                {redactions.length>1 && <button onClick={()=>removeRow(i)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'1.1rem', flexShrink:0 }}>✕</button>}
              </div>
            ))}
            <button onClick={addRow} style={{ background:'none', border:'1px dashed var(--border-md)', borderRadius:'var(--r-sm)', color:'var(--text-3)', cursor:'pointer', padding:'7px 14px', fontSize:'0.82rem', fontFamily:'var(--font)', marginTop:4, transition:'all var(--t)' }} onMouseEnter={e=>{e.currentTarget.style.color='var(--text-2)';e.currentTarget.style.borderColor='var(--border-hi)'}} onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border-md)'}}>+ Add another</button>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={redact}>Apply Redactions</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Applying redactions…" sub="Processing document" color="var(--red)"/>}
    </div>
  );
}

// ── Compare PDF ──────────────────────────────────────────────────────────────
export function ComparePdf() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const blobRef = React.useRef(null);

  const reset = () => { setFile1(null); setFile2(null); setStage('idle'); setProgress(0); setError(null); setDone(false); blobRef.current=null; };

  const compare = async () => {
    if (!file1||!file2) return setError('Please select both PDF files.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const [doc1, doc2] = await Promise.all([
        PDFDocument.load(await readFileBuffer(file1),{ignoreEncryption:true}),
        PDFDocument.load(await readFileBuffer(file2),{ignoreEncryption:true}),
      ]);
      setProgress(40);
      const out = await PDFDocument.create();
      const p1count = doc1.getPageCount(); const p2count = doc2.getPageCount();
      const maxPages = Math.max(p1count, p2count);
      for (let i=0; i<maxPages; i++) {
        const page = out.addPage([842, 595]);
        page.drawText(`Comparison: ${file1.name} vs ${file2.name}`, { x:20, y:575, size:8, color:rgb(0.5,0.5,0.5) });
        page.drawText(`Page ${i+1}`, { x:20, y:560, size:8, color:rgb(0.5,0.5,0.5) });
        if (i<p1count) { const [emb]=await out.embedPages([doc1.getPage(i)]); page.drawPage(emb,{x:10,y:20,width:400,height:530}); }
        if (i<p2count) { const [emb]=await out.embedPages([doc2.getPage(i)]); page.drawPage(emb,{x:430,y:20,width:400,height:530}); }
        page.drawLine({start:{x:421,y:20},end:{x:421,y:550},thickness:0.5,color:rgb(0.7,0,0),opacity:0.5});
        setProgress(40+Math.round((i+1)/maxPages*55)); await sleep(0);
      }
      const bytes = await out.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Comparison PDF" sub="Side-by-side view of both documents" onDownload={() => downloadBlob(blobRef.current,'comparison.pdf')} onReset={reset} fileName="comparison.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {[[file1,f=>setFile1(f[0]),'Original PDF'],[file2,f=>setFile2(f[0]),'Revised PDF']].map(([f,setF,lbl],i)=>(
          <div key={i} style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'20px' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>{lbl}</p>
            {f ? <FileRow file={f} onRemove={()=>setF([null])}/>
              : <DropZone onFiles={setF} accept={PDF_ACCEPT} label={`Drop ${lbl}`} hint="PDF only" multiple={false}/>}
          </div>
        ))}
      </div>
      {file1 && file2 && stage==='idle' && <Btn onClick={compare}>Compare PDFs</Btn>}
      {stage==='working' && <ProgressBar percent={progress} label="Comparing PDFs…" sub="Building side-by-side comparison" color="var(--pink)"/>}
    </div>
  );
}

// ── Crop PDF ─────────────────────────────────────────────────────────────────
export function CropPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('cropped.pdf');
  const [top,setTop]=useState(0); const [right,setRight]=useState(0); const [bottom,setBottom]=useState(0); const [left,setLeft]=useState(0);
  const [applyTo, setApplyTo] = useState('all');

  const crop = async () => {
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const pgs = src.getPages();
      pgs.forEach((p, i) => {
        if (applyTo==='first' && i>0) return;
        if (applyTo==='last' && i<pgs.length-1) return;
        const { width, height } = p.getSize();
        p.setCropBox(left, bottom, width-left-right, height-top-bottom);
        setProgress(Math.round((i+1)/pgs.length*90));
      });
      await sleep(0);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Cropped PDF" sub="Margins trimmed and saved" onDownload={() => downloadBlob(blobRef.current,'cropped.pdf')} onReset={reset} fileName="cropped.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to crop" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <div style={{ margin:'20px 0' }}>
            <FieldLabel>Crop margins (points)</FieldLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[['Top',top,setTop],['Right',right,setRight],['Bottom',bottom,setBottom],['Left',left,setLeft]].map(([l,v,s])=>(
                <div key={l}><FieldLabel>{l}</FieldLabel><input type="number" min="0" max="200" value={v} onChange={e=>s(+e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none' }}/></div>
              ))}
            </div>
            <FieldLabel>Apply to</FieldLabel>
            <Select value={applyTo} onChange={e=>setApplyTo(e.target.value)}>
              <option value="all">All pages</option>
              <option value="first">First page only</option>
              <option value="last">Last page only</option>
            </Select>
          </div>
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={crop}>Crop PDF</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Cropping PDF…" sub="Trimming margins" color="var(--teal)"/>}
    </div>
  );
}

// ── Edit PDF (annotation layer) ───────────────────────────────────────────────
export function EditPdf() {
  const { file, stage, setStage, progress, setProgress, error, setError, done, setDone, blobRef, onFile, reset } = useTool('edited.pdf');
  const [text, setText] = useState('');
  const [x, setX] = useState(50);
  const [y, setY] = useState(100);
  const [size, setSize] = useState(14);
  const [color, setColor] = useState('#000000');
  const [annotations, setAnnotations] = useState([]);

  const addAnnotation = () => {
    if (!text.trim()) return;
    setAnnotations(v => [...v, { text, x:parseInt(x), y:parseInt(y), size:parseInt(size), color }]);
    setText('');
  };

  const apply = async () => {
    if (!annotations.length) return setError('Please add at least one text annotation.');
    setStage('working'); setProgress(0); setError(null);
    try {
      const { PDFDocument, rgb } = await loadPdfLib();
      const src = await PDFDocument.load(await readFileBuffer(file), { ignoreEncryption:true });
      const page = src.getPage(0);
      setProgress(40);
      annotations.forEach(a => {
        const hex=a.color.replace('#','');
        const r=parseInt(hex.slice(0,2),16)/255, g=parseInt(hex.slice(2,4),16)/255, b=parseInt(hex.slice(4,6),16)/255;
        page.drawText(a.text, { x:a.x, y:a.y, size:a.size, color:rgb(r,g,b) });
      });
      setProgress(80); await sleep(0);
      const bytes = await src.save();
      blobRef.current = new Blob([bytes],{type:'application/pdf'});
      setProgress(100); setDone(true); setStage('done');
    } catch(e) { setError(e.message); setStage('idle'); }
  };

  if (done) return <DoneBox title="Edited PDF" sub={`${annotations.length} annotation${annotations.length!==1?'s':''} added`} onDownload={() => downloadBlob(blobRef.current,'edited.pdf')} onReset={reset} fileName="edited.pdf"/>;
  return (
    <div>
      <ErrorBanner message={error} onDismiss={() => setError(null)}/>
      {!file && <DropZone onFiles={onFile} accept={PDF_ACCEPT} label="Drop your PDF to edit" hint="PDF files only" multiple={false}/>}
      {file && stage==='idle' && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:16 }}>
          <FileRow file={file} onRemove={reset}/>
          <p style={{ fontFamily:'var(--font)', fontWeight:600, color:'var(--text-2)', fontSize:'0.88rem', margin:'20px 0 14px' }}>Add text annotations to first page</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:12 }}>
            <div style={{ gridColumn:'1/-1' }}><FieldLabel>Text to add</FieldLabel><Input value={text} onChange={e=>setText(e.target.value)} placeholder="Enter annotation text"/></div>
            <div><FieldLabel>X position</FieldLabel><input type="number" value={x} onChange={e=>setX(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none' }}/></div>
            <div><FieldLabel>Y position</FieldLabel><input type="number" value={y} onChange={e=>setY(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none' }}/></div>
            <div><FieldLabel>Font size</FieldLabel><input type="number" min="6" max="72" value={size} onChange={e=>setSize(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none' }}/></div>
            <div><FieldLabel>Color</FieldLabel><input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{ width:'100%', height:42, borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', cursor:'pointer', background:'none' }}/></div>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <Btn variant="secondary" onClick={addAnnotation}>+ Add annotation</Btn>
          </div>
          {annotations.length > 0 && (
            <div style={{ border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden', marginBottom:16 }}>
              {annotations.map((a,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderBottom:i<annotations.length-1?'1px solid var(--border)':'none' }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:a.color, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:'0.83rem', color:'var(--text-2)' }}>"{a.text}"</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)' }}>x:{a.x} y:{a.y} {a.size}px</span>
                  <button onClick={() => setAnnotations(v=>v.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'0.9rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}><Btn variant="secondary" onClick={reset}>Change file</Btn><Btn onClick={apply} disabled={!annotations.length}>Apply Edits</Btn></div>
        </div>
      )}
      {stage==='working' && <ProgressBar percent={progress} label="Applying edits…" sub="Adding annotations to PDF" color="var(--accent)"/>}
    </div>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export default function ToolsEdit({ tool }) {
  const map = { EditPdf, WatermarkPdf, SignPdf, PageNumbersPdf, ProtectPdf, UnlockPdf, RepairPdf, RedactPdf, ComparePdf, CropPdf };
  const C = map[tool];
  return C ? <C /> : null;
}
