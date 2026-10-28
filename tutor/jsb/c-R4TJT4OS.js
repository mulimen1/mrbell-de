import{b as x,c as w}from"./c-EUFSF62R.js";import{e as v}from"./c-OFPKBKBD.js";var D="tutor",M=1,p=null;function _(){return p||(p=new Promise((e,t)=>{let n;try{n=indexedDB.open(D,M)}catch(i){t(i);return}n.onupgradeneeded=()=>{let i=n.result;i.objectStoreNames.contains("docs")||i.createObjectStore("docs",{keyPath:"id"}),i.objectStoreNames.contains("kv")||i.createObjectStore("kv")},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)}),p)}async function g(e,t,n){let i=await _();return new Promise((h,r)=>{let s=i.transaction(e,t),o=s.objectStore(e),c,b=n(o);b&&(b.onsuccess=()=>{c=b.result}),s.oncomplete=()=>h(c),s.onerror=()=>r(s.error),s.onabort=()=>r(s.error)})}var l={docs:new Map,kv:new Map},y=!1;async function d(e,t){if(y)return t();try{return await e()}catch(n){return y=!0,console.warn("IndexedDB nicht verf\xFCgbar, nutze Arbeitsspeicher",n),t()}}var u={all:()=>d(()=>g("docs","readonly",e=>e.getAll()),()=>[...l.docs.values()]).then(e=>(e||[]).sort((t,n)=>(n.used||n.created)-(t.used||t.created))),get:e=>d(()=>g("docs","readonly",t=>t.get(e)),()=>l.docs.get(e)),put:e=>d(()=>g("docs","readwrite",t=>t.put(e)),()=>l.docs.set(e.id,e)),del:e=>d(()=>g("docs","readwrite",t=>t.delete(e)),()=>l.docs.delete(e))},f={get:e=>d(()=>g("kv","readonly",t=>t.get(e)),()=>l.kv.get(e)),set:(e,t)=>d(()=>g("kv","readwrite",n=>n.put(t,e)),()=>l.kv.set(e,t))};async function C(){try{indexedDB.deleteDatabase(D)}catch{}try{Object.keys(localStorage).filter(e=>e.startsWith("tutor.")).forEach(e=>localStorage.removeItem(e))}catch{}l.docs.clear(),l.kv.clear(),p=null}async function A(){let e=await u.all();return new Blob([JSON.stringify({app:"tutor",v:1,at:Date.now(),docs:e})],{type:"application/json"})}async function F(e){let t=JSON.parse(await e.text());if(!t||t.app!=="tutor"||!Array.isArray(t.docs))throw new Error(w("Keine Tutor-Sicherung","Not a tutor backup"));for(let n of t.docs)n&&n.id&&Array.isArray(n.pages)&&await u.put(n);return t.docs.length}var a={doc:null,list:[]},k=new Set,G=e=>(k.add(e),()=>k.delete(e)),B=()=>k.forEach(e=>{try{e(a)}catch(t){console.error(t)}}),m=null;function I(e=a.doc){e&&(e.used=Date.now(),clearTimeout(m),m=setTimeout(()=>u.put(e).catch(t=>console.warn("Speichern fehlgeschlagen",t)),250))}async function L(e=a.doc){e&&(clearTimeout(m),e.used=Date.now(),await u.put(e))}async function z(){return a.list=await u.all(),B(),a.list}async function N(e){let t=await u.get(e);return t?(a.doc=S(t),f.set("last",e),B(),a.doc):null}async function O({name:e,pages:t,chars:n,sample:i=!1,generated:h=!1,topic:r="",extra:s=null}){let o=S(Object.assign({id:v(),name:e,pages:t,chars:n,created:Date.now(),used:Date.now(),sample:i,generated:h,topic:r},s||{}));return await u.put(o),a.doc=o,f.set("last",o.id),await z(),o}async function U(e){await u.del(e),a.doc&&a.doc.id===e&&(a.doc=null),await z()}async function Z(){return f.get("last")}function S(e){return e.quizzes||(e.quizzes=[]),e.decks||(e.decks=[]),e.podcasts||(e.podcasts=[]),e.chat||(e.chat=[]),e.boards||(e.boards=[]),e.mistakes||(e.mistakes=[]),e.stats||(e.stats={answered:0,correct:0,days:{}}),e.lessons||(e.lessons={}),e}function R(e){let t=a.doc;if(!t)return;t.stats.answered++,e&&t.stats.correct++;let n=new Date().toISOString().slice(0,10);t.stats.days[n]=(t.stats.days[n]||0)+1,I()}function W(e=a.doc){if(!e)return 0;let t=[];if(e.path&&e.path.chapters?.length){let r=e.path.chapters,s=r.reduce((o,c)=>o+(c.weight||2),0);t.push([r.reduce((o,c)=>o+(c.weight||2)*(c.done?Math.max(.6,c.score??.8):c.started?.2:0),0)/s,2])}let n=e.quizzes.filter(r=>r.results?.length);n.length&&t.push([n.slice(-5).reduce((r,s)=>r+Math.max(...s.results.map(o=>o.score)),0)/Math.min(5,n.length),1.5]);let i=e.decks.flatMap(r=>r.cards);if(i.length&&t.push([i.filter(r=>(r.reps||0)>0&&(r.ivl||0)>=3).length/i.length,1]),!t.length)return 0;let h=t.reduce((r,s)=>r+s[1],0);return Math.round(100*t.reduce((r,s)=>r+s[0]*s[1],0)/h)}var E={name:"Beispiel \xB7 Deckungsbeitragsrechnung",pages:[`Kosten- und Leistungsrechnung
Kapitel 4: Teilkostenrechnung und Deckungsbeitragsrechnung
Lernziele: Sie k\xF6nnen variable und fixe Kosten trennen, den Deckungsbeitrag berechnen, die Gewinnschwelle bestimmen und kurzfristige Entscheidungen (Preisuntergrenze, Zusatzauftrag, Engpass) mit Deckungsbeitr\xE4gen treffen.`,`Warum Teilkostenrechnung?
Die Vollkostenrechnung verteilt alle Kosten \u2013 auch die Fixkosten \u2013 auf die Produkte. F\xFCr kurzfristige Entscheidungen f\xFChrt das oft zu Fehlern: Fixkosten fallen kurzfristig ohnehin an, egal ob ein Produkt hergestellt wird oder nicht. Die Teilkostenrechnung rechnet den Produkten deshalb nur die variablen Kosten zu. Die Fixkosten werden als Block behandelt.`,`Variable und fixe Kosten
Variable Kosten \xE4ndern sich mit der Ausbringungsmenge (z. B. Material, Fertigungsl\xF6hne im Akkord, Verpackung). Fixe Kosten bleiben innerhalb einer Periode bei schwankender Menge gleich (z. B. Miete, Geh\xE4lter, Abschreibungen, Versicherungen).
Kostenfunktion: \\(K(x) = K_f + k_v \\cdot x\\)
\\(K_f\\) = Fixkosten, \\(k_v\\) = variable St\xFCckkosten, \\(x\\) = Menge.`,`Der Deckungsbeitrag
Der Deckungsbeitrag (DB) ist die Differenz zwischen Umsatzerl\xF6sen und variablen Kosten: \\(DB = U - K_v\\).
St\xFCckdeckungsbeitrag: \\(db = p - k_v\\) (Preis minus variable St\xFCckkosten).
Der Deckungsbeitrag zeigt, wie viel ein Produkt zur Deckung der Fixkosten beitr\xE4gt. Erst wenn die Summe der Deckungsbeitr\xE4ge die Fixkosten \xFCbersteigt, entsteht Gewinn: Betriebsergebnis \\(= DB - K_f\\).
Beispiel: Preis 50 \u20AC, variable St\xFCckkosten 30 \u20AC, db = 20 \u20AC.`,`Break-even-Analyse (Gewinnschwelle)
Die Gewinnschwelle (Break-even-Menge) ist die Menge, bei der Erl\xF6se und Gesamtkosten gleich sind. Gewinn = 0.
\\(x^{*} = \\frac{K_f}{db} = \\frac{K_f}{p - k_v}\\)
Beispiel: Fixkosten 60.000 \u20AC, Preis 50 \u20AC, kv 30 \u20AC \u2192 db = 20 \u20AC \u2192 \\(x^{*} = \\frac{60.000}{20} = 3.000\\) St\xFCck.
Break-even-Umsatz \\(= x^{*} \\cdot p = 150.000\\) \u20AC.
Sicherheitsstrecke (Sicherheitsabstand) \\(= \\frac{\\text{Ist-Menge} - x^{*}}{\\text{Ist-Menge}}\\). Bei 4.000 verkauften St\xFCck: \\(\\frac{4.000 - 3.000}{4.000} = 25\\,\\%\\).`,`Preisuntergrenzen
Kurzfristige Preisuntergrenze: Der Preis muss mindestens die variablen St\xFCckkosten decken (\\(p \\geq k_v\\)), denn die Fixkosten fallen kurzfristig ohnehin an. Jeder positive Deckungsbeitrag verbessert das Ergebnis.
Langfristige Preisuntergrenze: Der Preis muss die vollen St\xFCckkosten (Selbstkosten) decken: \\(p \\geq k_v + \\frac{K_f}{x}\\).
Beispiel: \\(k_v\\) = 30 \u20AC, \\(K_f\\) = 60.000 \u20AC, \\(x\\) = 3.000 \u2192 langfristige Preisuntergrenze 50 \u20AC.`,`Zusatzauftrag
Ein Zusatzauftrag lohnt sich kurzfristig, wenn (1) freie Kapazit\xE4t vorhanden ist und (2) der angebotene Preis \xFCber den variablen St\xFCckkosten liegt, also ein positiver Deckungsbeitrag entsteht. Zus\xE4tzliche auftragsfixe Kosten (z. B. Sonderwerkzeug) m\xFCssen vom Deckungsbeitrag des Auftrags gedeckt werden.
Beispiel: Anfrage \xFCber 500 St\xFCck zu 38 \u20AC, \\(k_v\\) = 30 \u20AC \u2192 \\(DB = 500 \\cdot 8 = 4.000\\) \u20AC \u2192 annehmen, wenn Kapazit\xE4t frei ist.`,`Engpassplanung
Gibt es keinen Engpass, werden alle Produkte mit positivem St\xFCckdeckungsbeitrag hergestellt.
Gibt es einen Engpass (z. B. begrenzte Maschinenstunden), entscheidet der relative Deckungsbeitrag: \\(\\text{db je Engpasseinheit} = \\frac{db}{\\text{Beanspruchung des Engpasses}}\\).
Beispiel: Produkt A: db 20 \u20AC, 2 Std. \u2192 10 \u20AC/Std. Produkt B: db 30 \u20AC, 5 Std. \u2192 6 \u20AC/Std. Rangfolge: zuerst A, dann B \u2013 obwohl B den h\xF6heren absoluten db hat.`,`Mehrstufige Deckungsbeitragsrechnung
Die Fixkosten werden schrittweise den Bereichen zugeordnet, die sie verursachen:
Umsatzerl\xF6se \u2212 variable Kosten = DB I
DB I \u2212 Erzeugnisfixkosten = DB II
DB II \u2212 Erzeugnisgruppenfixkosten = DB III
DB III \u2212 Bereichsfixkosten = DB IV
Summe DB IV \u2212 Unternehmensfixkosten = Betriebsergebnis
Vorteil: Man sieht, welches Produkt und welche Gruppe welche Fixkosten tats\xE4chlich deckt.`,`Zusammenfassung
\u2013 Teilkostenrechnung: nur variable Kosten werden den Produkten zugerechnet.
\u2013 \\(db = p - k_v\\); Betriebsergebnis \\(= \\sum DB - K_f\\).
\u2013 Break-even-Menge \\(x^{*} = \\frac{K_f}{db}\\).
\u2013 Kurzfristige Preisuntergrenze = \\(k_v\\), langfristige = Selbstkosten je St\xFCck.
\u2013 Zusatzauftrag: annehmen, wenn Kapazit\xE4t frei und \\(db \\gt 0\\).
\u2013 Engpass: Rangfolge nach relativem Deckungsbeitrag.`]},P={name:"Example \xB7 Contribution margin accounting",pages:[`Cost and Management Accounting
Chapter 4: Marginal costing and contribution margin accounting
Learning objectives: You can separate variable and fixed costs, calculate the contribution margin, determine the break-even point and make short-term decisions (price floor, special order, bottleneck) using contribution margins.`,`Why marginal costing?
Full costing allocates all costs \u2013 including fixed costs \u2013 to the products. For short-term decisions this often leads to mistakes: in the short term, fixed costs are incurred anyway, whether a product is made or not. Marginal costing therefore assigns only the variable costs to the products. Fixed costs are treated as a single block.`,`Variable and fixed costs
Variable costs change with the output volume (e.g. materials, piece-rate production wages, packaging). Fixed costs stay the same within a period even when volume fluctuates (e.g. rent, salaries, depreciation, insurance).
Cost function: \\(C(x) = C_f + c_v \\cdot x\\)
\\(C_f\\) = fixed costs, \\(c_v\\) = variable cost per unit, \\(x\\) = quantity.`,`The contribution margin
The contribution margin (CM) is the difference between sales revenue and variable costs: \\(CM = R - C_v\\).
Unit contribution margin: \\(cm = p - c_v\\) (price minus variable cost per unit).
The contribution margin shows how much a product contributes to covering fixed costs. Only once the total of all contribution margins exceeds fixed costs is there a profit: operating result \\(= CM - C_f\\).
Example: price \u20AC50, variable cost per unit \u20AC30, cm = \u20AC20.`,`Break-even analysis
The break-even point (break-even quantity) is the quantity at which revenue and total costs are equal. Profit = 0.
\\(x^{*} = \\frac{C_f}{cm} = \\frac{C_f}{p - c_v}\\)
Example: fixed costs \u20AC60,000, price \u20AC50, cv \u20AC30 \u2192 cm = \u20AC20 \u2192 \\(x^{*} = \\frac{60{,}000}{20} = 3{,}000\\) units.
Break-even revenue \\(= x^{*} \\cdot p\\) = \u20AC150,000.
Margin of safety \\(= \\frac{\\text{actual quantity} - x^{*}}{\\text{actual quantity}}\\). With 4,000 units sold: \\(\\frac{4{,}000 - 3{,}000}{4{,}000} = 25\\,\\%\\).`,`Price floors
Short-term price floor: the price must at least cover the variable cost per unit (\\(p \\geq c_v\\)), because fixed costs are incurred anyway in the short term. Every positive contribution margin improves the result.
Long-term price floor: the price must cover the full cost per unit (total unit cost): \\(p \\geq c_v + \\frac{C_f}{x}\\).
Example: \\(c_v\\) = \u20AC30, \\(C_f\\) = \u20AC60,000, \\(x\\) = 3,000 \u2192 long-term price floor \u20AC50.`,`Special order
A special order pays off in the short term if (1) there is spare capacity and (2) the price offered is above the variable cost per unit, i.e. it generates a positive contribution margin. Additional order-specific fixed costs (e.g. special tooling) must be covered by the order's contribution margin.
Example: request for 500 units at \u20AC38, \\(c_v\\) = \u20AC30 \u2192 CM = \\(500 \\cdot 8\\) = \u20AC4,000 \u2192 accept if capacity is available.`,`Bottleneck planning
If there is no bottleneck, all products with a positive unit contribution margin are produced.
If there is a bottleneck (e.g. limited machine hours), the relative contribution margin decides: \\(\\text{cm per bottleneck unit} = \\frac{cm}{\\text{use of the bottleneck}}\\).
Example: product A: cm \u20AC20, 2 hrs \u2192 \u20AC10/hr. Product B: cm \u20AC30, 5 hrs \u2192 \u20AC6/hr. Ranking: A first, then B \u2013 even though B has the higher absolute cm.`,`Multi-level contribution margin accounting
Fixed costs are assigned step by step to the areas that cause them:
Sales revenue \u2212 variable costs = CM I
CM I \u2212 product fixed costs = CM II
CM II \u2212 product group fixed costs = CM III
CM III \u2212 division fixed costs = CM IV
Total CM IV \u2212 company-wide fixed costs = operating result
Advantage: you can see which product and which group actually covers which fixed costs.`,`Summary
\u2013 Marginal costing: only variable costs are assigned to the products.
\u2013 \\(cm = p - c_v\\); operating result \\(= \\sum CM - C_f\\).
\u2013 Break-even quantity \\(x^{*} = \\frac{C_f}{cm}\\).
\u2013 Short-term price floor = \\(c_v\\), long-term = total cost per unit.
\u2013 Special order: accept if capacity is free and \\(cm \\gt 0\\).
\u2013 Bottleneck: rank by relative contribution margin.`]},J=x?P:E;export{C as a,A as b,F as c,a as d,G as e,B as f,I as g,L as h,z as i,N as j,O as k,U as l,Z as m,S as n,R as o,W as p,J as q};
