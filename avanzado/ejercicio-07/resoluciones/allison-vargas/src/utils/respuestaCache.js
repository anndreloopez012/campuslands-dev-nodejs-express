import { createHash } from 'node:crypto';

export function modoDeCache(req) {
  const cabecera = (req.get('cache-control') ?? '').toLowerCase();
  if (cabecera.includes('no-store')) return 'omitir';
  if (cabecera.includes('no-cache')) return 'refrescar';
  return 'normal';
}

const etiquetaDe = (contenido) => `"${createHash('sha1').update(JSON.stringify(contenido)).digest('hex').slice(0, 16)}"`;

export function coincide(cabecera, etag) {
  if (!cabecera) return false;
  if (cabecera.trim() === '*') return true;
  return cabecera.split(',').map((e) => e.trim()).map((e) => (e.startsWith('W/') ? e.slice(2) : e)).includes(etag);
}

export function responderConCache(req, res, { data, estado, restanteMs, extras = {} }) {
  const etag = etiquetaDe({ data, extras });
  res.set('X-Cache', estado);
  res.set('ETag', etag);
  res.set('Cache-Control', restanteMs === null ? 'no-store' : `private, max-age=${Math.floor(restanteMs / 1000)}`);
  if (coincide(req.get('if-none-match'), etag)) return res.status(304).end();
  return res.status(200).json({ ok: true, data, ...extras });
}
