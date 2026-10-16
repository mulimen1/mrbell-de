// bwlmax.de: Startseite und Favicon kommen vom Tutor (nicht von mrbell.de).
// Läuft vor den statischen Dateien; für alle anderen Domains passiert hier nichts.
export const config = { matcher: ['/', '/favicon.ico'] };

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '');
  if (host !== 'bwlmax.de' && host !== 'www.bwlmax.de') return;
  const url = new URL(request.url);
  const target = url.pathname === '/favicon.ico' ? '/tutor/img/favicon.ico' : '/tutor/index.html';
  return new Response(null, { headers: { 'x-middleware-rewrite': new URL(target, request.url).toString() } });
}
