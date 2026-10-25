// Max-Modus (erst nur Gründer-Konto, zum Testen und Filmen – echt, nicht gespielt):
// Max disst dich zuerst, antwortet immer gesprochen und baut Übersichten als animierte Mindmap an der Tafel –
// jeder Ast fliegt erst rein, wenn Max mit dem Cursor dort ist und ihn erklärt. Ein-/aus: „/maxmode“ im Tutor.
import { ls, toast } from './util.js';
import { getAccount } from './api.js';
import { L } from './i18n.js';

const ADMIN = ['bendeschler0@gmail.com'];
const KEY = 'tutor.maxmode';
export const allowed = () => { const a = getAccount(); return !!(a && ADMIN.includes(String(a.email || '').toLowerCase())); };
export const on = () => allowed() && ls.get(KEY, 1) !== 0;
export function sync() { document.documentElement.classList.toggle('maxmode', on()); }
export function toggle(v) { if (!allowed()) return false; const nv = v == null ? !on() : !!v; ls.set(KEY, nv ? 1 : 0); sync(); toast(nv ? L('Max-Modus an: Max disst, spricht und baut animierte Übersichten.', 'Max mode on.') : L('Max-Modus aus.', 'Max mode off.')); return true; }
export const isCmd = t => /^\/max(mode|modus)\b/i.test(String(t || '').trim());
export function cmd(t) { const a = String(t || '').toLowerCase(); return toggle(/\b(aus|off|0)\b/.test(a) ? false : /\b(an|on|1)\b/.test(a) ? true : null); }

export const prompt = () => L(`[Max-Modus: Du bist richtig frech und lustig-toxisch (nie unter der Gürtellinie, nie zu Aussehen, Herkunft oder Ähnlichem).
- Deine gesprochene Antwort beginnt IMMER mit einem kurzen, gemeinen Spruch gegen den Nutzer, der zur Frage passt (z. B. dass er das Thema eigentlich schon im ersten Semester hätte können müssen, dass er sonntags lernt, dass sein Prof ihn so nicht sehen sollte). Dann ein Satz wie „Kein Stress, ich erklär's dir an der Tafel.“ Insgesamt höchstens 3 Sätze.
- Will der Nutzer eine Übersicht, Erklärung oder ein Thema lernen: Die Tafel beginnt mit genau EINER Mindmap in diesem Format (sonst nichts drumherum):
<div class="mindmap"><ul><li data-say="Ein Satz, worum es geht – mit kleinem Seitenhieb">Thema<ul><li data-say="Ein lockerer Satz, was dieser Ast ist, gern mit Spruch">Ast 1<ul><li>Unterpunkt</li><li>Unterpunkt</li></ul></li><li data-say="…">Ast 2<ul><li>…</li></ul></li></ul></li></ul></div>
  3 bis 5 Äste, je 2 bis 3 Unterpunkte. Begriffe kurz: Äste höchstens 3 Wörter, Unterpunkte höchstens 4 Wörter. Jedes data-say höchstens 22 Wörter, fachlich korrekt, wie ein Kumpel, der es draufhat.
- Danach an der Tafel höchstens 2 kurze Blöcke (z. B. Formel oder Merksatz), jeweils mit data-say.]`,
  `[Max mode: be cheeky and playfully toxic (never below the belt). Your spoken answer ALWAYS starts with a short roast of the user related to the question, then "No stress, I'll explain it on the board." Max 3 sentences. For overviews the board starts with exactly ONE mind map: <div class="mindmap"><ul><li data-say="…">Topic<ul><li data-say="…">Branch<ul><li>Sub</li></ul></li></ul></li></ul></div> – 3–5 branches, 2–3 subpoints each, short terms. Then at most 2 short blocks with data-say.]`);

// ---------- Mindmap: verschachtelte Liste → animierte Grafik ----------
const NS = 'http://www.w3.org/2000/svg';
const mk = (t, a = {}, kids = []) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) if (v != null) e.setAttribute(k, v); kids.forEach(k => k && e.appendChild(k)); return e; };
const label = li => { let s = ''; for (const n of li.childNodes) if (n.nodeType === 3 || (n.nodeType === 1 && !/^(UL|OL)$/.test(n.nodeName))) s += n.textContent; return s.replace(/\s+/g, ' ').trim(); };
// Text auf höchstens 2 Zeilen umbrechen
function lines(t, max) { const w = t.split(' '); const out = ['']; for (const x of w) { const cur = out[out.length - 1]; if ((cur + ' ' + x).trim().length > max && cur && out.length < 2) out.push(x); else out[out.length - 1] = (cur + ' ' + x).trim(); } if (out[1] && out[1].length > max + 2) out[1] = out[1].slice(0, max) + '…'; return out; }
function textEl(x, y, t, size, max, cls) {
  const ls2 = lines(t, max), el = mk('text', { x, y: y - (ls2.length - 1) * size * .55 + size * .35, 'text-anchor': 'middle', 'font-size': size, class: cls });
  ls2.forEach((s, i) => { const ts = mk('tspan', { x, dy: i ? size * 1.1 : 0 }); ts.textContent = s; el.appendChild(ts); });
  return el;
}

export function enhance(t) {
  if (!on() || !t) return;
  t.querySelectorAll('.mindmap').forEach(box => {
    const top = box.querySelector(':scope > ul > li, :scope > ol > li'); if (!top) return;
    const branches = [...(top.querySelector(':scope > ul, :scope > ol') || { children: [] }).children].filter(x => x.nodeName === 'LI').slice(0, 6);
    if (!branches.length) return;
    const n = branches.length, W = 1000, colW = W / n, kids = branches.map(b => [...(b.querySelector(':scope > ul, :scope > ol') || { children: [] }).children].filter(x => x.nodeName === 'LI').slice(0, 4).map(label));
    const maxK = Math.max(0, ...kids.map(k => k.length)), H = 250 + maxK * 62 + 20;
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'mm2', role: 'img', 'aria-label': label(top) });
    // Wurzel
    const rw = Math.min(520, 120 + label(top).length * 15);
    const root = mk('g', { class: 'mm2-root', 'data-say': top.getAttribute('data-say') || '' }, [mk('rect', { x: W / 2 - rw / 2, y: 18, width: rw, height: 74, rx: 22, class: 'mm2-rr' }), textEl(W / 2, 55, label(top), 34, 26, 'mm2-rt')]);
    svg.appendChild(root);
    branches.forEach((b, i) => {
      const cx = colW * i + colW / 2, bw = Math.min(colW - 24, 230), by = 160, g = mk('g', { class: 'mm2-b wait', 'data-say': b.getAttribute('data-say') || label(b), style: `--fx:${-cx - 120}px;--fy:${H - by}px` });
      g.appendChild(mk('path', { class: 'mm2-l', d: `M${W / 2} 92 C${W / 2} 130,${cx} 112,${cx} ${by - 30}`, pathLength: 100 }));
      const node = mk('g', { class: 'mm2-n' }, [mk('rect', { x: cx - bw / 2, y: by - 30, width: bw, height: 60, rx: 18, class: 'mm2-br' }), textEl(cx, by, label(b), n > 4 ? 21 : 24, n > 4 ? 13 : 16, 'mm2-bt')]);
      g.appendChild(node);
      kids[i].forEach((k, j) => {
        const ky = by + 78 + j * 62, kw = Math.min(colW - 34, 210);
        g.appendChild(mk('path', { class: 'mm2-l k', d: `M${cx} ${j ? by + 78 + (j - 1) * 62 + 23 : by + 30} L${cx} ${ky - 23}`, pathLength: 100, style: `--d:${.45 + j * .18}s` }));
        g.appendChild(mk('g', { class: 'mm2-k', style: `--d:${.55 + j * .18}s` }, [mk('rect', { x: cx - kw / 2, y: ky - 23, width: kw, height: 46, rx: 14, class: 'mm2-kr' }), textEl(cx, ky, k, n > 4 ? 16 : 18, n > 4 ? 16 : 20, 'mm2-kt')]));
      });
      svg.appendChild(g);
    });
    const wrap = document.createElement('div'); wrap.className = 'mm2-wrap'; wrap.appendChild(svg);
    box.replaceWith(wrap);
    // Sicherheitsnetz: läuft keine Führung, ist nach 25 s trotzdem alles sichtbar
    setTimeout(() => revealAll(wrap), 25000);
  });
}
export function reveal(el) {
  const g = el && el.closest && el.closest('.mm2-b');
  if (!g || !g.classList.contains('wait')) return null;
  g.classList.remove('wait'); g.classList.add('go');
  return new Promise(r => setTimeout(r, 700));
}
export function revealAll(scope) { (scope || document).querySelectorAll('.mm2-b.wait').forEach(g => { g.classList.remove('wait'); g.classList.add('go'); }); }
sync();
// Tippt man Max etwas, wird er groß (Max-Modus)
const isIn = e => !!(e.target && e.target.closest && e.target.closest('.ai-isl'));
addEventListener('focusin', e => { if (isIn(e)) document.documentElement.classList.add('mm-typing'); });
addEventListener('focusout', e => { if (isIn(e)) document.documentElement.classList.remove('mm-typing'); });
