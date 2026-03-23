import React from 'react';
import { Footer } from '../components/shared/Footer';

function LegalLayout({ title, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <main style={{ flex:1, maxWidth:800, margin:'0 auto', padding:'48px 40px 60px', width:'100%' }}>
        <h1 style={{ fontFamily:'var(--font)', fontWeight:800, fontSize:'2rem', letterSpacing:'-0.04em', color:'var(--text)', marginBottom:8 }}>{title}</h1>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--text-3)', marginBottom:36 }}>Last updated: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
        <div style={{ fontSize:'0.9rem', color:'var(--text-2)', lineHeight:1.85 }}>{children}</div>
      </main>
      <Footer/>
    </div>
  );
}

function H2({ children }) { return <h2 style={{ fontFamily:'var(--font)', fontWeight:700, fontSize:'1.1rem', color:'var(--text)', marginTop:32, marginBottom:10, letterSpacing:'-0.02em' }}>{children}</h2>; }
function P({ children }) { return <p style={{ marginBottom:14 }}>{children}</p>; }

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <P>PixelPress ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our website at pixelpress.tools (the "Service").</P>
      <H2>Information We Collect</H2>
      <P>PixelPress does not collect, store, or transmit any files you upload or process. All PDF processing happens entirely within your browser using local computing resources. Your documents never leave your device.</P>
      <P>We may collect anonymized usage data (such as which tools are used most frequently) through analytics services to help us improve the product. This data does not include any file content or personally identifiable information.</P>
      <H2>How Your Files Are Processed</H2>
      <P>All file processing is performed locally in your web browser using JavaScript and Web APIs (such as pdf-lib and Canvas API). No files are uploaded to our servers at any point. This means your documents remain completely private and confidential.</P>
      <H2>Cookies and Local Storage</H2>
      <P>We use localStorage to remember your theme preference (light or dark mode). No tracking cookies are set by PixelPress. Third-party services such as Google Analytics or Google AdSense may set their own cookies — please refer to their respective privacy policies.</P>
      <H2>Google AdSense</H2>
      <P>We may display advertisements served by Google AdSense. Google uses cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings.</P>
      <H2>Third-Party Services</H2>
      <P>Our website uses Google Fonts to load web fonts. This causes your browser to send a request to Google's servers. Please refer to Google's Privacy Policy for details on how Google handles this data.</P>
      <H2>Children's Privacy</H2>
      <P>Our Service is not directed to children under 13. We do not knowingly collect any personal information from children under 13.</P>
      <H2>Changes to This Policy</H2>
      <P>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated date.</P>
      <H2>Contact Us</H2>
      <P>If you have any questions about this Privacy Policy, please contact us at privacy@pixelpress.tools.</P>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <P>These Terms of Service govern your use of PixelPress ("Service") operated by PixelPress ("us", "we", or "our"). By accessing or using the Service, you agree to be bound by these Terms.</P>
      <H2>Use of Service</H2>
      <P>PixelPress provides free online PDF tools for personal and commercial use. You may use these tools to process your own files or files for which you have the legal right to process.</P>
      <H2>Prohibited Uses</H2>
      <P>You agree not to use the Service to process files containing illegal content, to infringe on any third party's intellectual property rights, or to attempt to reverse engineer or harm the Service.</P>
      <H2>Disclaimer of Warranties</H2>
      <P>The Service is provided "as is" without warranty of any kind. We do not warrant that the Service will be uninterrupted, error-free, or completely secure. PDF processing results may vary depending on the complexity of your files.</P>
      <H2>Limitation of Liability</H2>
      <P>PixelPress shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, the Service. Always keep backups of important documents.</P>
      <H2>Intellectual Property</H2>
      <P>The PixelPress brand, logo, and website design are our intellectual property. The underlying open-source libraries used (such as pdf-lib) are subject to their respective licenses.</P>
      <H2>Changes to Terms</H2>
      <P>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</P>
      <H2>Contact</H2>
      <P>For questions about these Terms, contact us at legal@pixelpress.tools.</P>
    </LegalLayout>
  );
}

export function AboutPage() {
  return (
    <LegalLayout title="About PixelPress">
      <P>PixelPress is a free, browser-based PDF tools suite designed to give everyone access to professional document processing — without uploading files to a server, without creating an account, and without paying anything.</P>
      <H2>Our mission</H2>
      <P>We believe document tools should be fast, private, and free. Too many PDF tools require you to upload sensitive documents to unknown servers, create accounts, or pay for basic functionality. PixelPress solves all three problems by running entirely in your browser.</P>
      <H2>How it works</H2>
      <P>PixelPress uses modern browser APIs and open-source libraries (primarily pdf-lib and the Canvas API) to process your files locally on your device. When you merge, compress, or convert a PDF, that work happens in your browser's JavaScript engine — not on our servers. Your files are never transmitted anywhere.</P>
      <H2>The tools</H2>
      <P>We offer 32 PDF tools covering everything from basic operations (merge, split, compress, rotate) to conversion (JPG to PDF, PDF to Word, HTML to PDF), editing (watermark, sign, page numbers, crop), and security (protect, unlock, redact). Two AI-powered tools (summarizer and translator) are currently in development.</P>
      <H2>Privacy first</H2>
      <P>We take privacy seriously. No file you process with PixelPress is ever sent to our servers. We collect only anonymized usage analytics (which tools are most popular) to help us improve the product.</P>
      <H2>Contact us</H2>
      <P>Have a question, found a bug, or want to suggest a new tool? Reach us at hello@pixelpress.tools. We read every email.</P>
    </LegalLayout>
  );
}

export function ContactPage() {
  return (
    <LegalLayout title="Contact Us">
      <P>We'd love to hear from you. Whether you have a question about a tool, found a bug, or want to suggest a new feature — reach out.</P>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, margin:'24px 0' }}>
        {[['General enquiries','hello@pixelpress.tools'],['Privacy','privacy@pixelpress.tools'],['Legal','legal@pixelpress.tools'],['Business','business@pixelpress.tools']].map(([lbl,email])=>(
          <div key={email} style={{ padding:'18px 20px', borderRadius:'var(--r-lg)', background:'var(--bg-2)', border:'1px solid var(--border)' }}>
            <p style={{ fontFamily:'var(--font)', fontWeight:600, fontSize:'0.85rem', color:'var(--text)', marginBottom:4 }}>{lbl}</p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--accent)' }}>{email}</p>
          </div>
        ))}
      </div>
      <P>We typically respond within 1-2 business days.</P>
    </LegalLayout>
  );
}
