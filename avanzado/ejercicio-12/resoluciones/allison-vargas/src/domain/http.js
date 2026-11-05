import { createHash } from 'node:crypto';

export const hash = (texto, largo = 16) => createHash('sha1').update(texto).digest('hex').slice(0, largo);

const sinDebil = (etag) => etag.trim().replace(/^W[/]/, '');

export function coincideEtag(cabecera, etag) {
  if (!cabecera) return false;
  if (cabecera.trim() === '*') return true;
  return cabecera.split(',').some((candidato) => sinDebil(candidato) === sinDebil(etag));
}

export function esFresco(req, { etag, modificadoEn }) {
  const ninguno = req.headers['if-none-match'];
  if (ninguno !== undefined) return coincideEtag(ninguno, etag);
  const desde = Date.parse(req.headers['if-modified-since'] ?? '');
  if (!Number.isNaN(desde)) return Math.floor(modificadoEn.getTime() / 1000) * 1000 <= desde;
  return false;
}
