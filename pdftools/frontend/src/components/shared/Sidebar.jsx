import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TOOLS_DISPLAY, CATEGORIES, CAT_COLORS } from '../../utils/tools';
import { useTheme } from '../../hooks/useTheme';

const CAT_ORDER = ['organise','edit','convert','security','ai'];

function NavBtn({ icon, label, active, collapsed, soon, onClick, color }) {
  const [hov, setHov] = useState(false);
  const bg = active ? `${color}20` : hov && !soon ? 'var(--bg-2)' : 'transparent';
  const col = active ? color : soon ? 'var(--text-3)' : hov ? 'var(--text-2)' : 'var(--text-3)';
  return (
    <button onClick={onClick} title={collapsed ? label : ''}
      onMouseEnter={() => !soon && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8, padding:collapsed?'9px 0':'7px 8px', borderRadius:'var(--r-sm)', border:'none', background:bg, color:col, cursor:soon?'not-allowed':'pointer', fontFamily:'var(--font)', fontSize:'0.8rem', fontWeight:active?600:400, transition:'all var(--t)', marginBottom:1, opacity:soon?0.4:1, position:'relative', overflow:'hidden' }}>
      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink:0, transition:'color var(--t)' }}>
        <path d={icon} stroke={active ? color : 'currentColor'} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {!collapsed && <span style={{ flex:1, textAlign:'left', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>}
      {!collapsed && soon && <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.55rem', padding:'1px 6px', borderRadius:100, background:'var(--amber-bg)', color:'var(--amber)', border:'1px solid rgba(217,119,6,.18)', flexShrink:0 }}>Soon</span>}
    </button>
  );
}

export function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, toggle } = useTheme();
  const grouped = {};
  TOOLS_DISPLAY.forEach(t => { if (!grouped[t.cat]) grouped[t.cat]=[]; grouped[t.cat].push(t); });

  const go = (route) => { nav(route); onMobileClose?.(); };

  return (
    <>
      <div className={`mob-overlay${mobileOpen?' on':''}`} onClick={onMobileClose}/>
      <aside className={`app-sidebar${collapsed?' collapsed':''}${mobileOpen?' mob-open':''}`}>
        {/* Logo */}
        <div onClick={() => go('/')} style={{ height:60, display:'flex', alignItems:'center', gap:10, padding:collapsed?'0 14px':'0 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', justifyContent:collapsed?'center':'flex-start', flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px var(--accent-glow)' }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <rect x="2" y="2" width="6" height="8" rx="1.5" fill="white" opacity=".95"/>
              <rect x="9" y="2" width="6" height="5" rx="1.5" fill="white" opacity=".6"/>
              <rect x="2" y="12" width="13" height="2.5" rx="1.2" fill="white" opacity=".45"/>
            </svg>
          </div>
          {!collapsed && <span style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'1.05rem', color:'var(--text)', letterSpacing:'-0.03em' }}>PixelPress</span>}
        </div>

        {/* All Tools */}
        <div style={{ padding:collapsed?'8px 4px':'8px 8px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <NavBtn icon="M2 8L8 2l6 6M3 7v8h4v-4h2v4h4V7" label="All Tools" active={loc.pathname==='/'} collapsed={collapsed} color="var(--accent)" onClick={() => go('/')}/>
        </div>

        {/* Tool list — scrollable */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:collapsed?'8px 4px':'8px 8px' }}>
          {CAT_ORDER.filter(c => grouped[c]).map(cat => {
            const cc = CAT_COLORS[cat];
            return (
              <div key={cat} style={{ marginBottom:4 }}>
                {!collapsed && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 8px 3px' }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:cc.accent }}/>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.59rem', color:cc.accent, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600, opacity:0.75 }}>{cc.label}</span>
                  </div>
                )}
                {grouped[cat].map(t => (
                  <NavBtn key={t.id} icon={t.icon} label={t.title}
                    active={loc.pathname === t.route}
                    collapsed={collapsed} soon={t.status==='soon'}
                    color={cc.accent}
                    onClick={() => t.status !== 'soon' && go(t.route)}/>
                ))}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:'1px solid var(--border)', padding:collapsed?'8px 4px':'8px 8px', flexShrink:0 }}>
          {/* Theme */}
          <NavBtn
            icon={theme==='light' ? 'M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M10.5 2.5l-1 1M2.5 10.5l1-1M7 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' : 'M11.5 8.5A5 5 0 0 1 5.5 2.5a5 5 0 1 0 6 6z'}
            label={theme==='light' ? 'Switch to dark' : 'Switch to light'}
            collapsed={collapsed} color="var(--text-2)"
            onClick={toggle}
          />
          {/* Collapse — desktop only */}
          <div className="desk-only">
            <NavBtn
              icon={collapsed ? 'M5 2l5 5-5 5' : 'M9 2L4 7l5 5'}
              label="Collapse sidebar"
              collapsed={collapsed} color="var(--text-2)"
              onClick={() => onCollapse?.(!collapsed)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuOpen }) {
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  return (
    <header className="mob-hdr">
      <button onClick={onMenuOpen} style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-2)', cursor:'pointer' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => nav('/')}>
        <div style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="6" height="8" rx="1.5" fill="white" opacity=".95"/><rect x="9" y="2" width="6" height="5" rx="1.5" fill="white" opacity=".6"/><rect x="2" y="12" width="13" height="2.5" rx="1.2" fill="white" opacity=".45"/></svg>
        </div>
        <span style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'0.95rem', color:'var(--text)', letterSpacing:'-0.02em' }}>PixelPress</span>
      </div>
      <button onClick={toggle} style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-2)', cursor:'pointer' }}>
        {theme==='light'
          ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9 1.5V3M9 15v1.5M1.5 9H3M15 9h1.5M3.6 3.6l1 1M13.4 13.4l1 1M13.4 3.6l-1 1M3.6 13.4l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 11A7 7 0 0 1 7 3a7 7 0 1 0 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        }
      </button>
    </header>
  );
}
