import React, { useState, lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/global.css';
import { ThemeProvider } from './hooks/useTheme';
import { Sidebar, MobileHeader } from './components/shared/Sidebar';
import { HomePage } from './pages/HomePage';
import { PrivacyPage, TermsPage, AboutPage, ContactPage } from './pages/LegalPages';
import { ToolLayout } from './components/shared/ToolLayout';
import { TOOL_MAP } from './utils/tools';

// ── Lazy-load all tool bundles ────────────────────────────────────────────────
const ToolsOrganise = lazy(() => import('./components/tools/ToolsOrganise'));
const ToolsEdit     = lazy(() => import('./components/tools/ToolsEdit'));
const ToolsConvert  = lazy(() => import('./components/tools/ToolsConvert'));

// ── Loading spinner ───────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:280, gap:12, padding:40 }}>
      <div style={{ width:26, height:26, borderRadius:'50%', border:'2.5px solid var(--bg-3)', borderTopColor:'var(--accent)', animation:'spin .8s linear infinite' }}/>
      <span style={{ fontFamily:'var(--font)', fontSize:'0.88rem', color:'var(--text-3)' }}>Loading…</span>
    </div>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding:40, textAlign:'center' }}>
        <p style={{ color:'var(--red)', fontFamily:'var(--font)', marginBottom:12 }}>Something went wrong loading this tool.</p>
        <button onClick={() => this.setState({ error:null })} style={{ padding:'8px 18px', borderRadius:'var(--r-md)', background:'var(--accent)', color:'white', border:'none', fontFamily:'var(--font)', cursor:'pointer' }}>Try again</button>
      </div>
    );
    return this.props.children;
  }
}

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFound() {
  const nav = useNavigate();
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center', minHeight:'60vh' }}>
      <div style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'6rem', letterSpacing:'-0.05em', color:'var(--bg-3)', lineHeight:1, marginBottom:16, userSelect:'none' }}>404</div>
      <h1 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.5rem', color:'var(--text)', marginBottom:8 }}>Page not found</h1>
      <p style={{ fontSize:'0.9rem', color:'var(--text-2)', marginBottom:28, maxWidth:300, lineHeight:1.6 }}>The page you're looking for doesn't exist. Try searching for the tool you need.</p>
      <button onClick={() => nav('/')} style={{ padding:'11px 26px', borderRadius:'var(--r-md)', background:'var(--accent)', color:'white', border:'none', fontFamily:'var(--font)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', transition:'all var(--t)' }}
        onMouseEnter={e => { e.currentTarget.style.background='var(--accent-2)'; e.currentTarget.style.boxShadow='0 4px 16px var(--accent-glow)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.boxShadow='none'; }}>
        Back to all tools
      </button>
    </div>
  );
}

// ── Coming soon ───────────────────────────────────────────────────────────────
function ComingSoon({ id }) {
  const tool = TOOL_MAP[id];
  if (!tool) return <NotFound/>;
  return (
    <ToolLayout tool={tool}>
      <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--r-2xl)', padding:'56px 40px', textAlign:'center' }}>
        <div style={{ width:68, height:68, borderRadius:'50%', background:'var(--amber-bg)', border:'1px solid rgba(217,119,6,.22)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8l10 6 10-6-10-6z" stroke="var(--amber)" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
            <path d="M4 20l10 6 10-6M4 14l10 6 10-6" stroke="var(--amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'1.9rem', letterSpacing:'-0.04em', color:'var(--text)', marginBottom:10 }}>Coming Soon</h2>
        <p style={{ fontSize:'0.95rem', color:'var(--text-2)', lineHeight:1.75, maxWidth:440, margin:'0 auto 24px' }}>{tool.desc}</p>
        <span style={{ display:'inline-flex', padding:'7px 20px', borderRadius:100, background:'var(--amber-bg)', border:'1px solid rgba(217,119,6,.22)', fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--amber)', letterSpacing:'0.05em' }}>In development</span>
      </div>
    </ToolLayout>
  );
}

// ── Tool wrapper ──────────────────────────────────────────────────────────────
function T({ id, children }) {
  const tool = TOOL_MAP[id];
  if (!tool) return <NotFound/>;
  return (
    <ToolLayout tool={tool}>
      <ErrorBoundary>
        <Suspense fallback={<Loader/>}>{children}</Suspense>
      </ErrorBoundary>
    </ToolLayout>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────
function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed} onCollapse={setCollapsed}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`app-main${collapsed ? ' collapsed' : ''}`}>
        <MobileHeader onMenuOpen={() => setMobileOpen(true)}/>
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage/>}/>

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPage/>}/>
          <Route path="/terms"   element={<TermsPage/>}/>
          <Route path="/about"   element={<AboutPage/>}/>
          <Route path="/contact" element={<ContactPage/>}/>

          {/* Organise */}
          <Route path="/jpg-to-pdf"   element={<T id="jpg-to-pdf">   <ToolsOrganise tool="JpgToPdf"/>   </T>}/>
          <Route path="/merge-pdf"    element={<T id="merge-pdf">    <ToolsOrganise tool="MergePdf"/>   </T>}/>
          <Route path="/split-pdf"    element={<T id="split-pdf">    <ToolsOrganise tool="SplitPdf"/>   </T>}/>
          <Route path="/compress-pdf" element={<T id="compress-pdf"> <ToolsOrganise tool="CompressPdf"/></T>}/>
          <Route path="/rotate-pdf"   element={<T id="rotate-pdf">   <ToolsOrganise tool="RotatePdf"/>  </T>}/>
          <Route path="/organise-pdf" element={<T id="organise-pdf"> <ToolsOrganise tool="OrganisePdf"/></T>}/>

          {/* Edit */}
          <Route path="/edit-pdf"      element={<T id="edit-pdf">      <ToolsEdit tool="EditPdf"/>      </T>}/>
          <Route path="/watermark-pdf" element={<T id="watermark-pdf"> <ToolsEdit tool="WatermarkPdf"/> </T>}/>
          <Route path="/sign-pdf"      element={<T id="sign-pdf">      <ToolsEdit tool="SignPdf"/>      </T>}/>
          <Route path="/page-numbers"  element={<T id="page-numbers">  <ToolsEdit tool="PageNumbersPdf"/></T>}/>
          <Route path="/repair-pdf"    element={<T id="repair-pdf">    <ToolsEdit tool="RepairPdf"/>    </T>}/>
          <Route path="/compare-pdf"   element={<T id="compare-pdf">   <ToolsEdit tool="ComparePdf"/>   </T>}/>
          <Route path="/redact-pdf"    element={<T id="redact-pdf">    <ToolsEdit tool="RedactPdf"/>    </T>}/>
          <Route path="/crop-pdf"      element={<T id="crop-pdf">      <ToolsEdit tool="CropPdf"/>      </T>}/>

          {/* Security */}
          <Route path="/protect-pdf" element={<T id="protect-pdf"> <ToolsEdit tool="ProtectPdf"/> </T>}/>
          <Route path="/unlock-pdf"  element={<T id="unlock-pdf">  <ToolsEdit tool="UnlockPdf"/>  </T>}/>

          {/* Convert */}
          <Route path="/pdf-to-jpg"   element={<T id="pdf-to-jpg">   <ToolsConvert tool="PdfToJpg"/>   </T>}/>
          <Route path="/html-to-pdf"  element={<T id="html-to-pdf">  <ToolsConvert tool="HtmlToPdf"/>  </T>}/>
          <Route path="/scan-to-pdf"  element={<T id="scan-to-pdf">  <ToolsConvert tool="ScanToPdf"/>  </T>}/>
          <Route path="/ocr-pdf"      element={<T id="ocr-pdf">      <ToolsConvert tool="OcrPdf"/>     </T>}/>
          <Route path="/pdf-to-pdfa"  element={<T id="pdf-to-pdfa">  <ToolsConvert tool="PdfToPdfa"/>  </T>}/>
          <Route path="/pdf-to-word"  element={<T id="pdf-to-word">  <ToolsConvert tool="PdfToWord"/>  </T>}/>
          <Route path="/word-to-pdf"  element={<T id="word-to-pdf">  <ToolsConvert tool="WordToPdf"/>  </T>}/>
          <Route path="/pdf-to-ppt"   element={<T id="pdf-to-ppt">   <ToolsConvert tool="PdfToPpt"/>   </T>}/>
          <Route path="/ppt-to-pdf"   element={<T id="ppt-to-pdf">   <ToolsConvert tool="PptToPdf"/>   </T>}/>
          <Route path="/pdf-to-excel" element={<T id="pdf-to-excel"> <ToolsConvert tool="PdfToExcel"/> </T>}/>
          <Route path="/excel-to-pdf" element={<T id="excel-to-pdf"> <ToolsConvert tool="ExcelToPdf"/> </T>}/>

          {/* AI */}
          <Route path="/ai-summarizer" element={<ComingSoon id="ai-summarizer"/>}/>
          <Route path="/translate-pdf" element={<ComingSoon id="translate-pdf"/>}/>

          {/* 404 */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Shell/>
      </BrowserRouter>
    </ThemeProvider>
  );
}
