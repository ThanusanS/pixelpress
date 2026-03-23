import React from 'react';

export function Btn({ children, onClick, variant='primary', disabled, style:sx={} }) {
  const base = { display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:'var(--r-md)', fontFamily:'var(--font)', fontSize:'0.88rem', fontWeight:600, cursor:disabled?'not-allowed':'pointer', border:'none', letterSpacing:'-0.01em', transition:'all var(--t)', opacity:disabled?0.5:1, ...sx };
  const v = {
    primary:   { background:'var(--accent)', color:'white' },
    secondary: { background:'var(--bg-3)', color:'var(--text-2)', border:'1px solid var(--border-md)' },
    danger:    { background:'var(--red-bg)', color:'var(--red)', border:'1px solid rgba(239,68,68,.2)' },
    success:   { background:'var(--green-bg)', color:'var(--green)', border:'1px solid rgba(34,197,94,.2)' },
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{ ...base, ...v[variant] }}
      onMouseEnter={e => { if(!disabled && variant==='primary'){ e.currentTarget.style.background='var(--accent-2)'; e.currentTarget.style.boxShadow='0 4px 20px var(--accent-glow)'; }}}
      onMouseLeave={e => { if(!disabled && variant==='primary'){ e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.boxShadow='none'; }}}
    >{children}</button>
  );
}

export function ProgressBar({ percent, label, sub, color='var(--accent)' }) {
  return (
    <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'28px 32px', marginTop:20, animation:'fadeUp .4s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', border:'2.5px solid var(--bg-4)', borderTopColor:color, animation:'spin .85s linear infinite', flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1rem', color:'var(--text)', marginBottom:2 }}>{label}</p>
          {sub && <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text-3)' }}>{sub}</p>}
        </div>
        <span style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'2.2rem', letterSpacing:'-0.04em', color, lineHeight:1 }}>{percent}%</span>
      </div>
      <div style={{ height:7, background:'var(--bg-4)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${percent}%`, background:color, borderRadius:4, transition:'width .3s var(--ease)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, bottom:0, width:'40%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent)', animation:'shimmer 1.5s ease infinite' }}/>
        </div>
      </div>
      {sub && <p style={{ marginTop:8, fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-3)' }}>{Math.round(percent)}% complete</p>}
    </div>
  );
}

export function DoneBox({ title, sub, onDownload, onReset, fileName='output.pdf' }) {
  return (
    <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-2xl)', overflow:'hidden', animation:'scaleIn .4s var(--ease)', marginTop:20 }}>
      <div style={{ height:3, background:'linear-gradient(90deg,var(--accent),var(--accent-3),var(--green))' }}/>
      <div style={{ padding:'36px 40px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-bg)', border:'1px solid rgba(34,197,94,.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, animation:'glowPulse 2.5s ease infinite' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polyline points="3,11 9,17 19,5" stroke="var(--green)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray:40, strokeDashoffset:0, animation:'checkIn .5s ease .1s both' }}/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'1.9rem', letterSpacing:'-0.04em', color:'var(--text)', lineHeight:1.1, marginBottom:6 }}>
              {title}{' '}<span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', color:'var(--green)' }}>ready.</span>
            </h2>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--text-3)', lineHeight:1.6 }}>{sub}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <Btn onClick={onDownload}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M4.5 7l3 3 3-3M2 13h11" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download {fileName}
          </Btn>
          <Btn variant="secondary" onClick={onReset}>Process another file</Btn>
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'var(--red-bg)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:16, animation:'fadeUp .3s ease' }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{flexShrink:0,marginTop:1}}><circle cx="7.5" cy="7.5" r="6.5" stroke="var(--red)" strokeWidth="1.4"/><line x1="7.5" y1="4.5" x2="7.5" y2="8" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7.5" cy="10" r="1" fill="var(--red)"/></svg>
      <span style={{ flex:1, fontSize:'0.85rem', color:'var(--red)', lineHeight:1.5, fontFamily:'var(--font)' }}>{message}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'1.1rem', padding:'0 2px', lineHeight:1 }}>✕</button>}
    </div>
  );
}

export function InfoBox({ children }) {
  return (
    <div style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent-2)', borderRadius:'0 var(--r-md) var(--r-md) 0', padding:'14px 18px', marginTop:16, fontFamily:'var(--font)', fontSize:'0.82rem', color:'var(--text-2)', lineHeight:1.7 }}>
      <span style={{ color:'var(--accent-3)', fontWeight:600, marginRight:6 }}>ℹ</span>{children}
    </div>
  );
}

export function FileRow({ file, onRemove }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', marginBottom:8 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M2 1.5h9l4 4v11H2z" stroke="var(--accent-3)" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M11 1.5v4h4" stroke="var(--accent-3)" strokeWidth="1.3" strokeLinecap="round"/></svg>
      <span style={{ flex:1, fontSize:'0.85rem', color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-3)', flexShrink:0 }}>{(file.size/1024).toFixed(0)} KB</span>
      {onRemove && <button onClick={onRemove} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:'0 2px', transition:'color var(--t)' }} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>✕</button>}
    </div>
  );
}

export function FieldLabel({ children }) {
  return <label style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:7 }}>{children}</label>;
}

export function Input({ value, onChange, placeholder, type='text', style:sx={} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width:'100%', padding:'11px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none', transition:'border-color var(--t)', ...sx }}
      onFocus={e => e.target.style.borderColor='var(--accent-2)'}
      onBlur={e => e.target.style.borderColor='var(--border-md)'}
    />
  );
}

export function Select({ value, onChange, children, style:sx={} }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:'100%', padding:'11px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-md)', background:'var(--bg-3)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.9rem', outline:'none', cursor:'pointer', ...sx }}>
      {children}
    </select>
  );
}
