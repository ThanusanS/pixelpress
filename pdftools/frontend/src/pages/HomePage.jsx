import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TOOLS_DISPLAY, CATEGORIES, CAT_COLORS } from '../utils/tools';
import { Footer } from '../components/shared/Footer';

// Scroll to top on homepage visit
function useScrollTop() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [loc.pathname]);
}

// ── Memoized tool card ────────────────────────────────────────────────────────
const ToolCard = React.memo(function ToolCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  const c = CAT_COLORS[tool.cat] || CAT_COLORS.convert;
  const soon = tool.status === 'soon';

  return (
    <article
      onMouseEnter={() => !soon && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={!soon ? onClick : undefined}
      role={!soon ? 'button' : undefined}
      tabIndex={!soon ? 0 : undefined}
      onKeyDown={e => !soon && e.key === 'Enter' && onClick?.()}
      aria-label={`${tool.title} — ${tool.desc}`}
      style={{
        background: `linear-gradient(145deg, ${c.bg.replace(/[\d.]+\)$/, hov ? '0.12)' : '0.06)')} 0%, var(--bg-1) 80%)`,
        border: `1.5px solid ${c.border.replace(/[\d.]+\)$/, hov ? '0.28)' : '0.14)')}`,
        borderRadius: 'var(--r-xl)',
        cursor: soon ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 32px ${c.bg.replace(/[\d.]+\)$/, '0.28)')}` : 'var(--sh-sm)',
        position: 'relative', overflow: 'hidden',
        outline: 'none',
      }}
    >
      {/* Always-visible top gradient bar */}
      <div style={{ height: 3, background: c.grad || `linear-gradient(135deg,${c.accent},${c.accent}88)`, borderRadius: 'var(--r-xl) var(--r-xl) 0 0' }}/>

      {/* Glow orb */}
      <div style={{ position:'absolute', top:-12, right:-12, width:72, height:72, borderRadius:'50%', background:`radial-gradient(circle, ${c.bg.replace(/[\d.]+\)$/, '0.55)')} 0%, transparent 70%)`, pointerEvents:'none', opacity: hov ? 1 : 0.5, transition:'opacity .2s' }}/>

      <div style={{ padding: '17px 17px 15px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ width:44, height:44, borderRadius:'var(--r-md)', background:c.bg, border:`1.5px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: hov ? `0 4px 12px ${c.bg.replace(/[\d.]+\)$/, '0.5)')}` : 'none', transition:'box-shadow .2s' }}>
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
              <path d={tool.icon} stroke={c.accent} strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          {soon && <span style={{ padding:'3px 8px', borderRadius:100, background:'var(--amber-bg)', border:'1px solid rgba(217,119,6,.2)', color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:600, flexShrink:0 }}>Soon</span>}
          {tool.featured && !soon && <span style={{ padding:'3px 8px', borderRadius:100, background:c.bg, border:`1px solid ${c.border}`, color:c.accent, fontFamily:'var(--font-mono)', fontSize:'0.58rem', fontWeight:600, flexShrink:0 }}>Popular</span>}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:c.accent, flexShrink:0 }}/>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.6rem', color:c.accent, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}>{c.label}</span>
        </div>

        <h3 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'0.94rem', color:'var(--text)', letterSpacing:'-0.01em', marginBottom:7, lineHeight:1.3 }}>{tool.title}</h3>
        <p style={{ fontSize:'0.76rem', color:'var(--text-3)', lineHeight:1.55 }}>{tool.desc}</p>

        <div style={{ position:'absolute', bottom:14, right:14, color:c.accent, fontSize:'1.05rem', opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition:'all .2s ease' }}>→</div>
      </div>
    </article>
  );
});

// ── Category header ───────────────────────────────────────────────────────────
const CatHeader = React.memo(function CatHeader({ cat }) {
  const c = CAT_COLORS[cat];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:c.bg, border:`1.5px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 8px ${c.bg.replace(/[\d.]+\)$/, '0.3)')}` }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:c.grad || c.accent }}/>
      </div>
      <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1rem', color:'var(--text)', letterSpacing:'-0.02em' }}>{c.label} tools</h2>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${c.border}, transparent)` }}/>
    </div>
  );
});

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <div className="stats-strip" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, borderRadius:'var(--r-xl)', overflow:'hidden', border:'1px solid var(--border)', marginBottom:40, boxShadow:'var(--sh-sm)' }}>
      {[['32','Tools available'],['0 KB','Uploaded to server'],['100%','Runs in browser'],['∞','No file limits']].map(([n,l],i,a) => (
        <div key={n} style={{ padding:'16px 12px', background:'var(--bg-1)', textAlign:'center', borderRight:i<a.length-1?'1px solid var(--border)':'none' }}>
          <div style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'1.5rem', letterSpacing:'-0.04em', color:'var(--accent)', lineHeight:1, marginBottom:4 }}>{n}</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.07em', lineHeight:1.3 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main homepage ─────────────────────────────────────────────────────────────
export function HomePage() {
  const nav = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  useScrollTop();

  // Reset document title
  useEffect(() => {
    document.title = 'PixelPress — Free Online PDF Tools | Merge, Split, Compress, Convert PDF';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', '32 free online PDF tools — merge, split, compress, convert, edit, sign, protect PDFs. No signup, no uploads, works entirely in your browser.');
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TOOLS_DISPLAY.filter(t => {
      const mc = filter === 'all' || t.cat === filter;
      const mq = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.cat.includes(q);
      return mc && mq;
    });
  }, [filter, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(t => { if (!g[t.cat]) g[t.cat]=[]; g[t.cat].push(t); });
    return g;
  }, [filtered]);

  const go = useCallback((tool) => { if (tool.status !== 'soon') nav(tool.route); }, [nav]);
  const CAT_ORDER = ['organise','edit','convert','security','ai'];

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <main className="page-pad" style={{ flex:1, padding:'48px 40px 0' }}>

        {/* Hero */}
        <header style={{ marginBottom:44, animation:'fadeUp .5s ease' }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2s ease infinite', display:'inline-block' }}/>
            32 free tools · no signup · 100% in your browser
          </p>
          <h1 className="hero-h1" style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'clamp(2rem,5vw,3.6rem)', letterSpacing:'-0.04em', lineHeight:1.08, color:'var(--text)', marginBottom:16 }}>
            Every PDF tool<br/>you'll ever{' '}
            <span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', color:'var(--accent)' }}>need.</span>
          </h1>
          <p style={{ fontSize:'1rem', color:'var(--text-2)', lineHeight:1.7, maxWidth:560 }}>
            Merge, split, compress, convert, edit, sign, protect and watermark PDFs.
            All 32 tools run in your browser — private, instant and completely free.
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:20 }}>
            {[['','Private — files never uploaded'],['','Instant processing'],['','No account required'],['','Works on all devices']].map(([ic,tx]) => (
              <span key={tx} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:100, background:'var(--bg-2)', border:'1px solid var(--border)', fontSize:'0.76rem', color:'var(--text-3)', fontFamily:'var(--font)' }}>{ic} {tx}</span>
            ))}
          </div>
        </header>

        <StatsStrip/>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg-1)', border:'1.5px solid var(--border)', borderRadius:'var(--r-lg)', padding:'0 16px', height:48, marginBottom:16, maxWidth:640, boxShadow:'var(--sh-sm)', transition:'border-color var(--t), box-shadow var(--t)' }}
          onFocusCapture={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px var(--accent-glow)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--sh-sm)'; }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="var(--text-3)" strokeWidth="1.5"/><line x1="11" y1="11" x2="15" y2="15" stroke="var(--text-3)" strokeWidth="1.7" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all PDF tools…" aria-label="Search PDF tools"
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.92rem' }}/>
          {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }} aria-label="Clear search">✕</button>}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40, alignItems:'center' }}>
          {CATEGORIES.map(cat => {
            const cc = CAT_COLORS[cat.id];
            const active = filter === cat.id;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)} aria-pressed={active} style={{ padding:'7px 18px', borderRadius:100, border:`1.5px solid ${active && cc ? cc.border : 'var(--border)'}`, background:active && cc ? cc.bg : 'var(--bg-1)', color:active && cc ? cc.accent : 'var(--text-3)', fontFamily:'var(--font)', fontSize:'0.82rem', fontWeight:active?700:400, cursor:'pointer', transition:'all var(--t)', boxShadow:active?`0 2px 8px ${cc?.bg.replace(/[\d.]+\)$/, '0.4)')} `:'none' }}>
                {cat.label}
              </button>
            );
          })}
          <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text-3)' }}>{filtered.length} tool{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {filter === 'all' && !search ? (
          CAT_ORDER.filter(c => grouped[c]).map((cat, idx) => (
            <section key={cat} style={{ marginBottom:52, animation:`fadeUp .45s ease ${idx * .07}s both` }} aria-label={`${CAT_COLORS[cat].label} PDF tools`}>
              <CatHeader cat={cat}/>
              <div className="card-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
                {grouped[cat].map(t => <ToolCard key={t.id} tool={t} onClick={() => go(t)}/>)}
              </div>
            </section>
          ))
        ) : (
          <section aria-live="polite">
            <div className="card-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, animation:'fadeUp .4s ease' }}>
              {filtered.length === 0
                ? <p style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--text-3)', fontFamily:'var(--font)', fontSize:'0.95rem' }}>No tools match "<strong>{search}</strong>"</p>
                : filtered.map(t => <ToolCard key={t.id} tool={t} onClick={() => go(t)}/>)
              }
            </div>
          </section>
        )}

        {/* SEO text block */}
        <section style={{ marginTop:64, padding:'36px 40px', background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-2xl)' }}>
          <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.4rem', letterSpacing:'-0.03em', color:'var(--text)', marginBottom:12 }}>Free PDF tools — no limits, no signup</h2>
          <p style={{ fontSize:'0.88rem', color:'var(--text-2)', lineHeight:1.85, maxWidth:760, marginBottom:24 }}>
            PixelPress gives you {TOOLS_DISPLAY.length} professional PDF tools completely free. Whether you need to <strong style={{ color:'var(--text)' }}>merge PDF</strong> files, <strong style={{ color:'var(--text)' }}>compress PDF</strong> documents, <strong style={{ color:'var(--text)' }}>convert PDF to Word</strong>, or <strong style={{ color:'var(--text)' }}>protect PDF</strong> with a password — everything runs in your browser. Your files never leave your device.
          </p>
          <div className="card-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:8 }}>
            {['Merge PDF','Split PDF','Compress PDF','PDF to Word','Word to PDF','JPG to PDF','PDF to JPG','Sign PDF','Protect PDF','Unlock PDF','Watermark PDF','Rotate PDF','Organise PDF','OCR PDF','HTML to PDF','Edit PDF'].map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 14px', borderRadius:'var(--r-md)', background:'var(--bg-2)', border:'1px solid var(--border)', fontSize:'0.8rem', color:'var(--text-2)', fontFamily:'var(--font)' }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polyline points="1,5.5 4,9 10,2" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}
