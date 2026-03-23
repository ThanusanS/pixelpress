import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function DropZone({ onFiles, accept, label, hint, disabled, multiple=true }) {
  const onDrop = useCallback(a => { if (!disabled) onFiles(a); }, [onFiles, disabled]);
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ onDrop, accept, multiple, disabled });

  const border = isDragReject ? 'var(--red)' : isDragActive ? 'var(--accent-2)' : 'var(--border-md)';
  const bg = isDragActive ? 'rgba(124,58,237,0.07)' : isDragReject ? 'var(--red-bg)' : 'var(--bg-2)';

  return (
    <div {...getRootProps()} style={{ border:`1.5px dashed ${border}`, borderRadius:'var(--r-xl)', padding:'52px 32px', textAlign:'center', cursor:disabled?'not-allowed':'pointer', background:bg, transition:'all var(--t)', opacity:disabled?0.5:1, position:'relative', overflow:'hidden' }}>
      <input {...getInputProps()} />
      {isDragActive && <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none' }}/>}
      <div style={{ width:60, height:60, borderRadius:'var(--r-lg)', background:isDragActive?'var(--accent-bg)':'var(--bg-3)', border:`1px solid ${isDragActive?'rgba(124,58,237,0.3)':'var(--border)'}`, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:18, transform:isDragActive?'scale(1.1) translateY(-4px)':'scale(1)', transition:'all var(--t)' }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 18V8M9 11l4-4 4 4" stroke={isDragActive?'var(--accent-3)':isDragReject?'var(--red)':'var(--text-2)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 18v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" stroke={isDragActive?'var(--accent-3)':isDragReject?'var(--red)':'var(--text-3)'} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.2rem', letterSpacing:'-0.02em', color:isDragActive?'var(--accent-3)':isDragReject?'var(--red)':'var(--text)', marginBottom:7, transition:'color var(--t)' }}>
        {isDragReject ? 'Wrong file type — check accepted formats' : isDragActive ? 'Drop your files here' : label}
      </p>
      {!isDragActive && !isDragReject && (
        <p style={{ fontSize:'0.88rem', color:'var(--text-2)', marginBottom: hint ? 18 : 0 }}>
          or <span style={{ color:'var(--accent-3)', fontWeight:600, textDecoration:'underline', textUnderlineOffset:3 }}>browse files</span> from your device
        </p>
      )}
      {hint && !isDragActive && !isDragReject && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:0, borderRadius:'var(--r-lg)', border:'1px solid var(--border)', background:'var(--bg-3)', overflow:'hidden' }}>
          {hint.split('·').map((h,i,a) => (
            <span key={i} style={{ padding:'6px 14px', fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-3)', borderRight:i<a.length-1?'1px solid var(--border)':'none', whiteSpace:'nowrap' }}>{h.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}
