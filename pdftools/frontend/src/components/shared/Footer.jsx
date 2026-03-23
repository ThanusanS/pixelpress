import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const nav = useNavigate();
  const yr = new Date().getFullYear();
  const cols = [
    { t:'Organise', links:[['Merge PDF','/merge-pdf'],['Split PDF','/split-pdf'],['Organise PDF','/organise-pdf'],['Rotate PDF','/rotate-pdf'],['Compress PDF','/compress-pdf']] },
    { t:'Edit',     links:[['Edit PDF','/edit-pdf'],['Watermark','/watermark-pdf'],['Sign PDF','/sign-pdf'],['Page Numbers','/page-numbers'],['Crop PDF','/crop-pdf']] },
    { t:'Convert',  links:[['JPG to PDF','/jpg-to-pdf'],['PDF to JPG','/pdf-to-jpg'],['PDF to Word','/pdf-to-word'],['Word to PDF','/word-to-pdf'],['HTML to PDF','/html-to-pdf']] },
    { t:'Security', links:[['Protect PDF','/protect-pdf'],['Unlock PDF','/unlock-pdf'],['Redact PDF','/redact-pdf']] },
    { t:'Company',  links:[['About Us','/about'],['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','/contact']] },
  ];
  const lnk = (label, href) => (
    <button key={href} onClick={() => nav(href)} style={{ display:'block', background:'none', border:'none', color:'var(--text-3)', fontSize:'0.8rem', fontFamily:'var(--font)', cursor:'pointer', padding:'3px 0', lineHeight:1.7, textAlign:'left', transition:'color var(--t)' }}
      onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>{label}</button>
  );

  return (
    <footer style={{ background:'var(--bg-1)', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 40px 32px' }}>
        {/* Grid — 2fr + 5 cols on desktop, 2-col on mobile via className */}
        <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'2fr repeat(5,1fr)', gap:32, marginBottom:40 }}>
          {/* Brand — full width on mobile */}
          <div className="footer-brand">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, cursor:'pointer' }} onClick={() => nav('/')}>
              <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="16" height="16" viewBox="0 0 17 17" fill="none">
                  <rect x="2" y="2" width="6" height="8" rx="1.5" fill="white" opacity=".95"/>
                  <rect x="9" y="2" width="6" height="5" rx="1.5" fill="white" opacity=".6"/>
                  <rect x="2" y="12" width="13" height="2.5" rx="1.2" fill="white" opacity=".45"/>
                </svg>
              </div>
              <span style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'1rem', color:'var(--text)', letterSpacing:'-0.02em' }}>PixelPress</span>
            </div>
            <p style={{ fontSize:'0.82rem', color:'var(--text-3)', lineHeight:1.75, maxWidth:210 }}>32 free PDF tools. No signup. No file uploads. Everything runs in your browser.</p>
            <div style={{ display:'flex', gap:6, marginTop:16, flexWrap:'wrap' }}>
              {[['','Private'],['','Fast'],['','Free']].map(([ic,lb]) => (
                <span key={lb} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:100, background:'var(--bg-2)', border:'1px solid var(--border)', fontSize:'0.7rem', color:'var(--text-3)' }}>{ic} {lb}</span>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.t}>
              <p style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'0.8rem', color:'var(--text)', marginBottom:10, letterSpacing:'-0.01em' }}>{c.t}</p>
              {c.links.map(([l,h]) => lnk(l,h))}
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <p style={{ fontSize:'0.77rem', color:'var(--text-3)', fontFamily:'var(--font)' }}>© {yr} PixelPress. All rights reserved.</p>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','/contact']].map(([l,h]) => (
              <button key={h} onClick={() => nav(h)} style={{ background:'none', border:'none', color:'var(--text-3)', fontSize:'0.77rem', fontFamily:'var(--font)', cursor:'pointer', transition:'color var(--t)' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
