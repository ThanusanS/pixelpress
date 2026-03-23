import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CAT_COLORS } from '../../utils/tools';
import { Footer } from './Footer';

export function ToolLayout({ tool, children }) {
  const nav = useNavigate();
  const loc = useLocation();
  const c = CAT_COLORS[tool.cat] || CAT_COLORS.convert;

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [loc.pathname]);

  // Update SEO meta per tool
  useEffect(() => {
    document.title = tool.seoTitle || `${tool.title} — Free Online PDF Tool | PixelPress`;
    const sm = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    sm('meta[name="description"]', 'content', tool.seoDesc || tool.desc);
    sm('meta[property="og:title"]', 'content', tool.seoTitle || tool.title);
    sm('meta[property="og:description"]', 'content', tool.seoDesc || tool.desc);
    sm('link[rel="canonical"]', 'href', `https://pixelpress.tools${tool.route}`);
    // Inject FAQ schema
    const id = 'faq-schema';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const s = document.createElement('script');
    s.id = id; s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context':'https://schema.org', '@type':'FAQPage', mainEntity:[
      { '@type':'Question', name:`Is ${tool.title} really free?`, acceptedAnswer:{ '@type':'Answer', text:'Yes, completely free. No account required, no watermarks, no limits.' } },
      { '@type':'Question', name:'Are my files uploaded to a server?', acceptedAnswer:{ '@type':'Answer', text:'No. All processing happens in your browser. Your files never leave your device.' } },
      { '@type':'Question', name:'Does it work on mobile?', acceptedAnswer:{ '@type':'Answer', text:'Yes. PixelPress is fully responsive and works on any device.' } },
    ]});
    document.head.appendChild(s);
    return () => {
      document.title = 'PixelPress — Free Online PDF Tools';
      const sc = document.getElementById(id); if (sc) sc.remove();
    };
  }, [tool]);

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - var(--hdr, 0px))' }}>
      <main className="tool-pad" style={{ flex:1, padding:'36px 40px 56px', width:'100%', maxWidth:920 }}>

        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28, flexWrap:'wrap' }}>
          {[['Home','/'],['Tools','/'],c.label,tool.title].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color:'var(--text-3)', fontSize:'0.72rem' }}>›</span>}
              {typeof item === 'string' && item !== c.label ? (
                <button onClick={() => nav(item === 'Home' || item === 'Tools' ? '/' : '#')} style={{ background:'none', border:'none', color:'var(--text-3)', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--font)', padding:0, transition:'color var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>{item}</button>
              ) : (
                <span style={{ fontSize:'0.8rem', color: i === 3 ? 'var(--text-2)' : c.accent, fontFamily:'var(--font)', fontWeight: i === 3 ? 500 : 400 }}>{item}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Tool header */}
        <header style={{ display:'flex', alignItems:'flex-start', gap:18, marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:'var(--r-lg)', background:c.bg, border:`1.5px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 16px ${c.bg}` }}>
            <svg width="24" height="24" viewBox="0 0 15 15" fill="none">
              <path d={tool.icon} stroke={c.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:c.accent, textTransform:'uppercase', letterSpacing:'0.1em', padding:'2px 8px', borderRadius:100, background:c.bg, border:`1px solid ${c.border}`, fontWeight:600 }}>{c.label}</span>
              {tool.featured && <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--green)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:100, background:'var(--green-bg)', border:'1px solid rgba(5,150,105,.2)', fontWeight:600 }}>Most popular</span>}
            </div>
            <h1 style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'clamp(1.6rem,4vw,2.4rem)', letterSpacing:'-0.04em', color:'var(--text)', lineHeight:1.1, marginBottom:8 }}>{tool.title}</h1>
            <p style={{ fontSize:'0.95rem', color:'var(--text-2)', lineHeight:1.65, maxWidth:560 }}>{tool.desc}</p>
          </div>
        </header>

        {/* ── Main tool UI ── */}
        {children}

        {/* How to use */}
        <section style={{ marginTop:48, padding:'28px 32px', background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)' }} aria-label="How to use">
          <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.05rem', color:'var(--text)', marginBottom:16, letterSpacing:'-0.02em' }}>How to {tool.title.toLowerCase()}</h2>
          <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[['1. Upload file','Select your file by dragging and dropping it into the upload area, or click to browse your device.'],['2. Adjust settings',`Configure any options available for your ${tool.title.toLowerCase()} — then click the action button.`],['3. Download result','Your file is processed instantly in the browser. Click download to save the result to your device.']].map(([t,d]) => (
              <div key={t} style={{ padding:'14px 16px', borderRadius:'var(--r-md)', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                <p style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'0.82rem', color:c.accent, marginBottom:5 }}>{t}</p>
                <p style={{ fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About section — SEO */}
        <section style={{ marginTop:16, padding:'24px 32px', background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)' }}>
          <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.05rem', color:'var(--text)', marginBottom:10, letterSpacing:'-0.02em' }}>About {tool.title}</h2>
          <p style={{ fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.85 }}>
            {tool.seoDesc || tool.desc} Use PixelPress to {tool.title.toLowerCase()} online for free — no software to download, no account to create, and no file size limits. All processing runs entirely inside your browser using modern Web APIs. Your files are never transmitted to any server, ensuring complete privacy and security. Compatible with all devices including Windows, Mac, Linux, iPhone, iPad, and Android.
          </p>
        </section>

        {/* FAQ — schema.org + AdSense content */}
        <section style={{ marginTop:16, padding:'24px 32px', background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)' }}>
          <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.05rem', color:'var(--text)', marginBottom:16, letterSpacing:'-0.02em' }}>Frequently asked questions</h2>
          {[
            [`Is ${tool.title} free to use?`, `Yes, completely free. No premium plan, no watermark, no account. PixelPress is 100% free for everyone.`],
            ['Are my files uploaded to a server?', 'No. Everything is processed locally in your browser using JavaScript. Your files never leave your device — not even temporarily.'],
            ['What file sizes are supported?', 'There are no hard limits since processing is local. Performance depends on your device — most modern computers and phones handle files up to 500 MB comfortably.'],
            ['Does this work on iPhone and Android?', 'Yes. PixelPress is fully responsive and works on all mobile browsers including Safari on iOS and Chrome on Android.'],
            ['Can I use PixelPress for commercial work?', 'Absolutely. PixelPress is free for personal and commercial use with no restrictions.'],
          ].map(([q,a]) => (
            <details key={q} style={{ borderBottom:'1px solid var(--border)', paddingBottom:12, marginBottom:12 }} itemScope itemType="https://schema.org/Question">
              <summary style={{ fontFamily:'var(--font)', fontSize:'0.88rem', fontWeight:600, color:'var(--text)', cursor:'pointer', padding:'4px 0', userSelect:'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }} itemProp="name">
                {q}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0, color:'var(--text-3)' }}><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p itemProp="text" style={{ fontSize:'0.83rem', color:'var(--text-2)', lineHeight:1.75, paddingTop:8 }}>{a}</p>
              </div>
            </details>
          ))}
        </section>
      </main>
      <Footer/>
    </div>
  );
}
