// KI-HTML für die Tafel sicher machen: nur erlaubte Tags/Attribute, keine Skripte, keine Links, keine Styles.
const TAGS = new Set(['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em', 'u', 'small', 'sub', 'sup', 'br', 'hr', 'code', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
  'svg', 'g', 'line', 'rect', 'circle', 'ellipse', 'path', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'marker', 'title']);
const ATTR = new Set(['class', 'colspan', 'rowspan',
  'viewbox', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'd', 'points', 'transform',
  'text-anchor', 'dominant-baseline', 'font-size', 'font-weight', 'dx', 'dy', 'stroke-dasharray', 'opacity', 'fill-opacity',
  'marker-end', 'marker-start', 'refx', 'refy', 'markerwidth', 'markerheight', 'orient', 'id', 'preserveaspectratio',
  'data-say']);   // data-say: Max' „Warum“ zu diesem Tafel-Block (wird nur als Text angezeigt)
const SVGNS = 'http://www.w3.org/2000/svg';

export function sanitize(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  const walk = node => {
    for (const el of [...node.childNodes]) {
      if (el.nodeType === 3) continue;
      if (el.nodeType !== 1) { el.remove(); continue; }
      const t = el.localName.toLowerCase();
      if (!TAGS.has(t)) {
        // unbekannte Elemente: Inhalt behalten (außer gefährliche)
        if (['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'img', 'image', 'foreignobject', 'video', 'audio', 'form', 'input', 'button', 'a', 'use'].includes(t)) { el.remove(); continue; }
        walk(el); el.replaceWith(...el.childNodes); continue;
      }
      for (const a of [...el.attributes]) {
        const n = a.name.toLowerCase();
        const v = a.value;
        if (!ATTR.has(n) || /javascript:|url\s*\(|expression|@import/i.test(v)) el.removeAttribute(a.name);
        else if ((n === 'marker-end' || n === 'marker-start') && !/^url\(#[\w-]+\)$/.test(v)) el.removeAttribute(a.name);
      }
      if (el.hasAttribute('id')) el.setAttribute('id', 'tz-' + el.getAttribute('id').replace(/[^\w-]/g, ''));
      walk(el);
    }
  };
  walk(tpl.content);
  // SVG: Größe nicht fest, damit responsiv
  tpl.content.querySelectorAll('svg').forEach(s => {
    if (!s.getAttribute('viewBox') && !s.getAttribute('viewbox')) {
      const w = parseFloat(s.getAttribute('width')) || 600, hh = parseFloat(s.getAttribute('height')) || 300;
      s.setAttribute('viewBox', `0 0 ${w} ${hh}`);
    }
    s.removeAttribute('width'); s.removeAttribute('height');
    s.setAttribute('role', 'img');
  });
  // Zeilenumbrüche in calc-Blöcken beibehalten, <br> ist erlaubt
  return tpl.content;
}

export function sanitizeInto(el, html) {
  el.replaceChildren(sanitize(html));
  return el;
}

// Fließtext aus dem Chat: Text + **fett** + Zeilen, keine HTML-Injektion
export function richText(s) {
  const frag = document.createDocumentFragment();
  String(s || '').split('\n').forEach((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\((?:S|p|pp)\. ?\d+(?:[–-]\d+)?\))/g);
    for (const p of parts) {
      if (!p) continue;
      if (p.startsWith('**') && p.endsWith('**')) { const b = document.createElement('b'); b.textContent = p.slice(2, -2); frag.appendChild(b); }
      else if (/^\((?:S|p|pp)\. ?\d+/.test(p)) { const c = document.createElement('span'); c.className = 'cite'; c.textContent = p.slice(1, -1); frag.appendChild(c); }
      else frag.appendChild(document.createTextNode(p));
    }
    if (i < arr.length - 1) frag.appendChild(document.createElement('br'));
  });
  return frag;
}
