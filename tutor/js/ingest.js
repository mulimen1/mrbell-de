// Dateien lesen – komplett im Browser. Nichts wird hochgeladen.
// PDF (pdf.js), PowerPoint (.pptx), Word (.docx), Text/Markdown.
import { L } from './i18n.js';
let pdfjs = null;
async function loadPdf() {
  if (pdfjs) return pdfjs;
  pdfjs = await import('/tutor/vendor/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/tutor/vendor/pdf.worker.min.mjs';
  return pdfjs;
}

export const ACCEPT = '.pdf,.pptx,.docx,.txt,.md,application/pdf';
const MAX_BYTES = 60 * 1024 * 1024;

export async function readFile(file, onProgress = () => {}) {
  if (file.size > MAX_BYTES) throw new Error(L('Die Datei ist größer als 60 MB.', 'The file is larger than 60 MB.'));
  const name = file.name || L('Vorlesung', 'Lecture');
  const ext = (name.split('.').pop() || '').toLowerCase();
  let pages;
  if (ext === 'pdf' || file.type === 'application/pdf') pages = await readPdf(file, onProgress);
  else if (ext === 'pptx') pages = await readPptx(file, onProgress);
  else if (ext === 'docx') pages = await readDocx(file, onProgress);
  else if (ext === 'txt' || ext === 'md' || file.type.startsWith('text/')) pages = splitText(await file.text());
  else throw new Error(L('Dieses Format kenne ich noch nicht. PDF, PowerPoint (.pptx), Word (.docx) oder Text gehen.', 'I don’t know this format yet. PDF, PowerPoint (.pptx), Word (.docx) or text work.'));
  pages = pages.map(p => clean(p));
  const chars = pages.reduce((a, p) => a + p.length, 0);
  if (chars < 80) throw new Error(L('In der Datei ist kaum Text. Ist es ein eingescanntes PDF? Dann kann ich es leider noch nicht lesen.', 'There’s hardly any text in this file. Is it a scanned PDF? Sadly I can’t read those yet.'));
  return { name: name.replace(/\.[^.]+$/, ''), pages, chars };
}

function clean(s) {
  return String(s || '')
    .replace(/­/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function readPdf(file, onProgress) {
  const lib = await loadPdf();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await lib.getDocument({ data, isEvalSupported: false, disableFontFace: true, useSystemFonts: false }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i);
    const tc = await p.getTextContent();
    let out = '', lastY = null;
    for (const it of tc.items) {
      if (!('str' in it)) continue;
      const y = it.transform ? it.transform[5] : null;
      if (lastY != null && y != null && Math.abs(y - lastY) > 2) out += '\n';
      else if (out && !out.endsWith(' ') && !out.endsWith('\n') && it.str && !it.str.startsWith(' ')) out += ' ';
      out += it.str;
      if (it.hasEOL) out += '\n';
      lastY = y;
    }
    pages.push(out);
    p.cleanup && p.cleanup();
    onProgress(i / doc.numPages);
  }
  doc.destroy && doc.destroy();
  return pages;
}

// --- Minimaler ZIP-Leser (für .pptx/.docx) ---
async function unzip(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const dv = new DataView(buf.buffer);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error(L('Die Datei ist beschädigt.', 'The file is damaged.'));
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  const entries = {};
  const td = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
    const nlen = dv.getUint16(off + 28, true), xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
    const local = dv.getUint32(off + 42, true);
    const name = td.decode(buf.subarray(off + 46, off + 46 + nlen));
    entries[name] = { method, csize, local };
    off += 46 + nlen + xlen + clen;
  }
  return {
    names: Object.keys(entries),
    async text(name) {
      const e = entries[name]; if (!e) return '';
      const l = e.local, ln = dv.getUint16(l + 26, true), lx = dv.getUint16(l + 28, true);
      const raw = buf.subarray(l + 30 + ln + lx, l + 30 + ln + lx + e.csize);
      if (e.method === 0) return td.decode(raw);
      if (e.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error(L('Dein Browser kann diese Datei nicht entpacken. Speichere sie als PDF.', 'Your browser can’t unpack this file. Save it as a PDF.'));
      const ds = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return await new Response(ds).text();
    }
  };
}
function xmlText(xml, paraTag) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const paras = doc.getElementsByTagName(paraTag);
  const out = [];
  for (const p of paras) {
    let t = '';
    for (const n of p.getElementsByTagName('*')) if (n.localName === 't') t += n.textContent;
    if (t.trim()) out.push(t);
  }
  return out.join('\n');
}
async function readPptx(file, onProgress) {
  const z = await unzip(file);
  const slides = z.names.filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const pages = [];
  for (let i = 0; i < slides.length; i++) {
    let t = xmlText(await z.text(slides[i]), 'a:p');
    const notes = slides[i].replace('slides/slide', 'notesSlides/notesSlide');
    if (z.names.includes(notes)) { const nt = xmlText(await z.text(notes), 'a:p').replace(/^\d+$/m, '').trim(); if (nt) t += L('\n[Notizen] ', '\n[Notes] ') + nt; }
    pages.push(t);
    onProgress((i + 1) / slides.length);
  }
  return pages;
}
async function readDocx(file, onProgress) {
  const z = await unzip(file);
  const t = xmlText(await z.text('word/document.xml'), 'w:p');
  onProgress(1);
  return splitText(t);
}
function splitText(t) {
  // in „Seiten“ zu ~2.500 Zeichen an Absatzgrenzen teilen
  const paras = String(t).split(/\n\s*\n|\n/);
  const pages = []; let cur = '';
  for (const p of paras) { if ((cur + p).length > 2500 && cur) { pages.push(cur); cur = ''; } cur += p + '\n'; }
  if (cur.trim()) pages.push(cur);
  return pages.length ? pages : [''];
}
