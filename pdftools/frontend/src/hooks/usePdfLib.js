import { useRef } from "react";

let _promise = null;
export function loadPdfLib() {
  if (!_promise) {
    _promise = new Promise((resolve, reject) => {
      if (window.PDFLib) return resolve(window.PDFLib);
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
      s.onload = () => resolve(window.PDFLib);
      s.onerror = () => reject(new Error("Failed to load pdf-lib"));
      document.head.appendChild(s);
    });
  }
  return _promise;
}

/** Read a File as ArrayBuffer */
export function readFileBuffer(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error(`Cannot read ${file.name}`));
    r.readAsArrayBuffer(file);
  });
}

/** Convert image File → JPEG ArrayBuffer via Canvas (handles PNG transparency) */
export function imageToJpegBuffer(file, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || 800;
      c.height = img.naturalHeight || 600;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      c.toBlob(
        (blob) => {
          if (!blob) return reject(new Error(`Canvas failed for ${file.name}`));
          blob.arrayBuffer().then(resolve).catch(reject);
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot load ${file.name}`));
    };
    img.src = url;
  });
}

/** Trigger browser download from a Blob */
export function downloadBlob(blob, filename) {
  const ts = Date.now();
  const idx = filename.lastIndexOf(".");
  const uniqueName =
    idx === -1
      ? `${filename}-${ts}`
      : `${filename.slice(0, idx)}-${ts}${filename.slice(idx)}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = uniqueName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export { sleep };
