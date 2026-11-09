// Excel-Trainer als eigenständige Werkzeugseite (tutor/tools/excel-trainer.html).
// Quelle des Seitenskripts – gebündelt von tutor/tools/xl-build.mjs nach tutor/tools/xl/xt-<hash>.js.
// Derselbe Trainer wie in der App (tutor/js/xl/trainer.js), aber ohne App-JS und ohne Max: neutraler Ton,
// Fortschritt nur im Browser unter eigenem Schlüssel, Vorlagen-Links auf die freien Vorlagen-Seiten.
// Rechenmodul (/tutor/vendor/xlcalc@2.mjs) lädt lokal nach.
import { trainer } from '../../js/xl/trainer.js';
import { LESSONS } from '../../js/xl/lessons.js';

const mount = document.getElementById('xt-app');
document.documentElement.classList.add('xt-js');   // Lektionslisten im Abschnitt „Was du lernst“ stehen dann oben im Trainer
const BMW = window.BMW || {};
if (mount) {
  const t = trainer(mount, {
    app: false,
    key: 'bwlmax-werkzeug.excel-trainer',
    toast: m => (BMW.meldung ? BMW.meldung(m) : null),
    tplHref: id => '/tools/excel-vorlage-' + id,
    cheatHref: '#spickzettel'
  });
  // Direktlink auf eine Lektion: /tools/excel-trainer#lektion-sverweis
  const fromHash = () => { const m = /^#lektion-([a-z0-9-]+)$/.exec(location.hash || ''); if (m && LESSONS.some(l => l.id === m[1])) { t.open(m[1]); try { history.replaceState(null, '', location.pathname + location.search + '#trainer'); } catch (e) {} return true; } return false; };
  fromHash();
  addEventListener('hashchange', fromHash);
}
// Spickzettel drucken (nur dieser Abschnitt)
const pr = document.getElementById('xt-print');
if (pr) { pr.hidden = false; pr.addEventListener('click', () => { const sec = document.getElementById('spickzettel'); if (BMW.drucken) BMW.drucken(sec); else print(); }); }
