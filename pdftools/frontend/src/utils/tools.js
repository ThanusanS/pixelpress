/**
 * Tools registry — all 32 PDF tools
 * Category color palette (premium):
 *   organise → violet  #8b5cf6
 *   edit     → amber   #f59e0b
 *   convert  → blue    #3b82f6
 *   security → emerald #10b981
 *   ai       → rose    #f43f5e
 */

export const CAT_COLORS = {
  organise: { accent:'#8b5cf6', bg:'rgba(139,92,246,0.13)', border:'rgba(139,92,246,0.28)', label:'Organise', gradient:'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  edit:     { accent:'#f59e0b', bg:'rgba(245,158,11,0.13)', border:'rgba(245,158,11,0.28)', label:'Edit',     gradient:'linear-gradient(135deg,#d97706,#fbbf24)' },
  convert:  { accent:'#3b82f6', bg:'rgba(59,130,246,0.13)', border:'rgba(59,130,246,0.28)', label:'Convert',  gradient:'linear-gradient(135deg,#1d4ed8,#60a5fa)' },
  security: { accent:'#10b981', bg:'rgba(16,185,129,0.13)', border:'rgba(16,185,129,0.28)', label:'Security', gradient:'linear-gradient(135deg,#059669,#34d399)' },
  ai:       { accent:'#f43f5e', bg:'rgba(244,63,94,0.13)',  border:'rgba(244,63,94,0.28)',  label:'AI',       gradient:'linear-gradient(135deg,#e11d48,#fb7185)' },
};

export const CATEGORIES = [
  { id:'all',      label:'All tools' },
  { id:'organise', label:'Organise' },
  { id:'edit',     label:'Edit' },
  { id:'convert',  label:'Convert' },
  { id:'security', label:'Security' },
  { id:'ai',       label:'AI' },
];

export const TOOLS = [
  // ── ORGANISE ────────────────────────────────────────────────────────────────
  { id:'merge-pdf',    title:'Merge PDF',        cat:'organise', route:'/merge-pdf',    status:'live',
    desc:'Combine PDFs in the order you want with the easiest PDF merger available.',
    icon:'M3 4h4v9H3zM8 6h4v7H8zM5 13h6',
    seoTitle:'Merge PDF Files Online Free — Combine PDFs Instantly',
    seoDesc:'Merge multiple PDF files into one document online for free. No signup required. Combine PDFs in seconds directly in your browser.' },

  { id:'split-pdf',    title:'Split PDF',         cat:'organise', route:'/split-pdf',    status:'live',
    desc:'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon:'M2 7.5h11M9 4.5l4 3-4 3',
    seoTitle:'Split PDF Online Free — Extract Pages from PDF',
    seoDesc:'Split a PDF into individual pages or extract a range of pages for free. No software needed. Works entirely in your browser.' },

  { id:'organise-pdf', title:'Organise PDF',      cat:'organise', route:'/organise-pdf', status:'live',
    desc:'Sort pages of your PDF file however you like. Delete or add pages at your convenience.',
    icon:'M2 4h3v3H2zM6.5 4h3v3H6.5zM11 4h3v3h-3zM2 9.5h13v4H2z',
    seoTitle:'Organise PDF Pages Online — Reorder & Delete Pages',
    seoDesc:'Rearrange, reorder and delete pages from your PDF file online for free. Drag and drop page ordering, no signup required.' },

  { id:'rotate-pdf',   title:'Rotate PDF',        cat:'organise', route:'/rotate-pdf',   status:'live',
    desc:'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    icon:'M11.5 4A5.5 5.5 0 1 0 13.5 8M11.5 2v3h3',
    seoTitle:'Rotate PDF Online Free — Rotate PDF Pages 90° 180° 270°',
    seoDesc:'Rotate PDF pages online for free. Choose 90, 180 or 270 degree rotation. Apply to all pages or specific pages. No download needed.' },

  // ── EDIT ────────────────────────────────────────────────────────────────────
  { id:'compress-pdf', title:'Compress PDF',      cat:'edit',     route:'/compress-pdf', status:'live',
    desc:'Reduce file size while optimizing for maximal PDF quality.',
    icon:'M7.5 2v11M4.5 9.5l3 4 3-4M3 13.5h9',
    seoTitle:'Compress PDF Online Free — Reduce PDF File Size',
    seoDesc:'Compress PDF files online and reduce file size for free. Maintain quality while making your PDF smaller. No signup, instant download.' },

  { id:'edit-pdf',     title:'Edit PDF',          cat:'edit',     route:'/edit-pdf',     status:'live',
    desc:'Add text, images, shapes or freehand annotations to a PDF document.',
    icon:'M3 12.5l8-8 2 2-8 8H3zM10.5 5.5l2 2',
    seoTitle:'Edit PDF Online Free — Add Text & Annotations to PDF',
    seoDesc:'Edit PDF files online for free. Add text, annotations and notes to your PDF documents without any software download.' },

  { id:'watermark-pdf',title:'Watermark PDF',     cat:'edit',     route:'/watermark-pdf',status:'live',
    desc:'Stamp an image or text over your PDF in seconds. Choose typography, transparency and position.',
    icon:'M7.5 2l1.8 4.5H14l-3.6 2.8 1.4 4.7-4.3-3-4.3 3 1.4-4.7L1 6.5h4.7z',
    seoTitle:'Add Watermark to PDF Online Free — Stamp Text on PDF',
    seoDesc:'Add a text watermark to your PDF online for free. Choose font, color, size, opacity and position. No signup required.' },

  { id:'sign-pdf',     title:'Sign PDF',          cat:'edit',     route:'/sign-pdf',     status:'live',
    desc:'Sign yourself or request electronic signatures from others.',
    icon:'M3 12.5c2.5-5 5-7 7-5s0 5 2.5 2.5M2.5 14.5h10',
    seoTitle:'Sign PDF Online Free — Add Electronic Signature to PDF',
    seoDesc:'Electronically sign PDF documents online for free. Add your signature to any PDF without printing or scanning. Instant download.' },

  { id:'page-numbers', title:'Page numbers',      cat:'edit',     route:'/page-numbers', status:'live',
    desc:'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
    icon:'M3 2.5h9v11H3zM5.5 10h4M7.5 5v3.5M7.5 5l-2 1.5M7.5 5l2 1.5',
    seoTitle:'Add Page Numbers to PDF Online Free',
    seoDesc:'Add page numbers to your PDF online for free. Choose position, starting number and format. Apply to all pages instantly.' },

  { id:'repair-pdf',   title:'Repair PDF',        cat:'edit',     route:'/repair-pdf',   status:'live',
    desc:'Repair a damaged PDF and recover data from corrupt PDF files.',
    icon:'M7.5 2L2 7l5.5 5.5L13 7zM7.5 5v3M7.5 9.5v.5',
    seoTitle:'Repair Corrupt PDF Online Free — Fix Damaged PDF Files',
    seoDesc:'Repair and recover corrupted or damaged PDF files online for free. Fix broken PDFs that won\'t open. No software needed.' },

  { id:'compare-pdf',  title:'Compare PDF',       cat:'edit',     route:'/compare-pdf',  status:'live',
    desc:'Show a side-by-side document comparison and easily spot changes between file versions.',
    icon:'M2 3h4.5v10H2zM8.5 3H13v10H8.5zM6.5 7.5h2',
    seoTitle:'Compare PDF Files Online Free — Spot Differences Between PDFs',
    seoDesc:'Compare two PDF documents side by side online for free. Quickly identify differences and changes between PDF versions.' },

  { id:'redact-pdf',   title:'Redact PDF',        cat:'edit',     route:'/redact-pdf',   status:'live',
    desc:'Redact text and graphics to permanently remove sensitive information from a PDF.',
    icon:'M3 5.5h9v2H3zM3 9h7v2H3zM3 12.5h4.5v2H3z',
    seoTitle:'Redact PDF Online Free — Remove Sensitive Information from PDF',
    seoDesc:'Redact and permanently remove sensitive text and images from PDF files online for free. Protect confidential information securely.' },

  { id:'crop-pdf',     title:'Crop PDF',          cat:'edit',     route:'/crop-pdf',     status:'live',
    desc:'Crop margins of PDF documents or select specific areas, then apply to one or all pages.',
    icon:'M4.5 2v4H2.5M4.5 6h6v6M10.5 12h2v-2M4.5 2h2M10.5 14h2',
    seoTitle:'Crop PDF Online Free — Trim PDF Margins and Pages',
    seoDesc:'Crop PDF pages online for free. Trim margins, remove white space or select a custom crop area. Apply to one or all pages.' },

  // ── CONVERT ──────────────────────────────────────────────────────────────────
  { id:'jpg-to-pdf',   title:'JPG to PDF',        cat:'convert',  route:'/jpg-to-pdf',   status:'live', featured:true,
    desc:'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    icon:'M3 2.5h6l4 4v9H3zM9 2.5v4h4',
    seoTitle:'JPG to PDF Converter Online Free — Convert JPEG to PDF',
    seoDesc:'Convert JPG and PNG images to PDF online for free. Combine multiple images into one PDF. No signup, no watermark, instant download.' },

  { id:'pdf-to-jpg',   title:'PDF to JPG',        cat:'convert',  route:'/pdf-to-jpg',   status:'live',
    desc:'Convert each PDF page into a JPG or extract all images contained in a PDF.',
    icon:'M2 3h11v10H2zM4 9l2.5-3.5 2.5 3 2-2.5 2 3',
    seoTitle:'PDF to JPG Converter Online Free — Convert PDF Pages to Images',
    seoDesc:'Convert PDF pages to JPG images online for free. Extract images from PDF documents. High quality output, no signup required.' },

  { id:'pdf-to-word',  title:'PDF to Word',       cat:'convert',  route:'/pdf-to-word',  status:'live',
    desc:'Easily convert your PDF files into easy to edit DOC and DOCX documents. Almost 100% accurate.',
    icon:'M2 3h11v10H2zM5 6h5M5 8.5h5M5 11h3',
    seoTitle:'PDF to Word Converter Online Free — Convert PDF to DOC DOCX',
    seoDesc:'Convert PDF to Word documents online for free. Get editable DOC and DOCX files from your PDFs. Accurate conversion, no signup needed.' },

  { id:'word-to-pdf',  title:'Word to PDF',       cat:'convert',  route:'/word-to-pdf',  status:'live',
    desc:'Make DOC and DOCX files easy to read by converting them to PDF.',
    icon:'M3 2.5h6l4 4v9H3zM9 2.5v4h4M5 9h5M5 11.5h3',
    seoTitle:'Word to PDF Converter Online Free — Convert DOC DOCX to PDF',
    seoDesc:'Convert Word documents to PDF online for free. Transform DOC and DOCX files to PDF format. Preserves formatting, no signup needed.' },

  { id:'pdf-to-ppt',   title:'PDF to PowerPoint', cat:'convert',  route:'/pdf-to-ppt',   status:'live',
    desc:'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    icon:'M2 4h11v8H2zM6 8l3.5-2.5v5z',
    seoTitle:'PDF to PowerPoint Converter Online Free — PDF to PPT PPTX',
    seoDesc:'Convert PDF to PowerPoint presentations online for free. Get editable PPT and PPTX files from your PDFs instantly.' },

  { id:'ppt-to-pdf',   title:'PowerPoint to PDF', cat:'convert',  route:'/ppt-to-pdf',   status:'live',
    desc:'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    icon:'M2 4h11v8H2zM13 8H2M7.5 4v8',
    seoTitle:'PowerPoint to PDF Converter Online Free — PPT PPTX to PDF',
    seoDesc:'Convert PowerPoint presentations to PDF online for free. Transform PPT and PPTX files to PDF format. Free, fast, no signup.' },

  { id:'pdf-to-excel', title:'PDF to Excel',      cat:'convert',  route:'/pdf-to-excel', status:'live',
    desc:'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    icon:'M2 3h11v10H2zM6 3v10M2 7.5h11',
    seoTitle:'PDF to Excel Converter Online Free — Convert PDF to XLS XLSX',
    seoDesc:'Convert PDF tables and data to Excel spreadsheets online for free. Extract data from PDFs into editable XLS and XLSX files.' },

  { id:'excel-to-pdf', title:'Excel to PDF',      cat:'convert',  route:'/excel-to-pdf', status:'live',
    desc:'Make EXCEL spreadsheets easy to read by converting them to PDF.',
    icon:'M2 3h11v10H2zM2 7.5h11M6 3v10M9 3v10',
    seoTitle:'Excel to PDF Converter Online Free — Convert XLS XLSX to PDF',
    seoDesc:'Convert Excel spreadsheets to PDF online for free. Transform XLS and XLSX files to PDF format. Free, instant, no signup needed.' },

  { id:'html-to-pdf',  title:'HTML to PDF',       cat:'convert',  route:'/html-to-pdf',  status:'live',
    desc:'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want.',
    icon:'M3 5l-1.5 5L7.5 13l6-3L12 5M5 8h5M6 10.5h3',
    seoTitle:'HTML to PDF Converter Online Free — Convert Webpage to PDF',
    seoDesc:'Convert HTML webpages to PDF online for free. Enter a URL and download the page as a PDF document. No signup required.' },

  { id:'pdf-to-pdfa',  title:'PDF to PDF/A',      cat:'convert',  route:'/pdf-to-pdfa',  status:'live',
    desc:'Transform your PDF to PDF/A, the ISO-standardized version for long-term archiving.',
    icon:'M3 2.5h6l4 4v9H3zM9 2.5v4h4M5 9h5M5 11.5h3',
    seoTitle:'PDF to PDF/A Converter Online Free — Archival PDF Format',
    seoDesc:'Convert PDF to PDF/A format online for free. Create ISO-compliant archival PDFs for long-term document preservation.' },

  { id:'scan-to-pdf',  title:'Scan to PDF',       cat:'convert',  route:'/scan-to-pdf',  status:'live',
    desc:'Capture document scans from your mobile device and send them instantly to your browser.',
    icon:'M4 2.5h7l2 2v3H2V4.5zM2 7.5h11v7H2zM5 10.5h5',
    seoTitle:'Scan to PDF Online Free — Convert Scanned Images to PDF',
    seoDesc:'Convert scanned images and photos to PDF online for free. Upload scans from your phone or scanner and create a PDF instantly.' },

  { id:'ocr-pdf',      title:'OCR PDF',           cat:'convert',  route:'/ocr-pdf',      status:'live',
    desc:'Easily convert scanned PDF into searchable and selectable documents.',
    icon:'M2 4.5h11M2 7.5h11M2 10.5h7M4 13.5l2-2 2 2',
    seoTitle:'OCR PDF Online Free — Make Scanned PDF Searchable',
    seoDesc:'Use OCR to convert scanned PDF documents into searchable and selectable text. Free online OCR tool, no signup required.' },

  // ── SECURITY ─────────────────────────────────────────────────────────────────
  { id:'unlock-pdf',   title:'Unlock PDF',        cat:'security', route:'/unlock-pdf',   status:'live',
    desc:'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    icon:'M5 7.5V5a2.5 2.5 0 0 1 5 0M3 7.5h9v6H3zM7.5 10v2',
    seoTitle:'Unlock PDF Online Free — Remove PDF Password Protection',
    seoDesc:'Remove password protection from PDF files online for free. Unlock encrypted PDFs and gain full access to your documents instantly.' },

  { id:'protect-pdf',  title:'Protect PDF',       cat:'security', route:'/protect-pdf',  status:'live',
    desc:'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
    icon:'M7.5 2L3 4v4c0 3.5 2 5.5 4.5 6.5C10 13.5 12 11.5 12 8V4z',
    seoTitle:'Protect PDF with Password Online Free — Encrypt PDF',
    seoDesc:'Add password protection to your PDF files online for free. Encrypt PDF documents to secure sensitive content. No signup needed.' },

  // ── AI ────────────────────────────────────────────────────────────────────────
  { id:'ai-summarizer',title:'AI Summarizer',     cat:'ai',       route:'/ai-summarizer',status:'soon',
    desc:'Quickly generate concise summaries from articles, paragraphs, and essays in seconds.',
    icon:'M3 4h9M3 7h7M3 10h5M11 10l2 2-2 2',
    seoTitle:'AI PDF Summarizer — Summarize PDF Documents with AI',
    seoDesc:'Automatically summarize PDF documents using AI. Get concise key points from long documents in seconds. Coming soon.' },

  { id:'translate-pdf',title:'Translate PDF',     cat:'ai',       route:'/translate-pdf',status:'soon',
    desc:'Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.',
    icon:'M2 4h5M4.5 2v3M3 7c1 2.5 4 4 4 4M4 9s1.5 1 3 0M8 4h5.5M10.5 4v8M8.5 9h4',
    seoTitle:'Translate PDF Online Free — AI-Powered PDF Translation',
    seoDesc:'Translate PDF documents to any language using AI. Preserves original formatting, fonts and layout. Coming soon.' },
];

export const TOOLS_DISPLAY = TOOLS;
export const TOOL_MAP  = Object.fromEntries(TOOLS.map(t => [t.id, t]));
export const ROUTE_MAP = Object.fromEntries(TOOLS.map(t => [t.route, t]));
