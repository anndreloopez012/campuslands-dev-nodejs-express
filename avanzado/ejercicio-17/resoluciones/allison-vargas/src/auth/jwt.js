import { createHmac, timingSafeEqual } from 'node:crypto';
import { crear } from '../errores/index.js';

const base64url = (texto) => Buffer.from(texto).toString('base64url');
const CABECERA = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

const firma = (contenido, secreto) => createHmac('sha256', secreto).update(contenido).digest('base64url');

export function firmar(datos, { secreto, reloj, duracionS, emisor, audiencia }) {
  const ahora = Math.floor(reloj().getTime() / 1000);
  const cuerpo = base64url(JSON.stringify({
    ...datos, iss: emisor, aud: audiencia, iat: ahora, exp: ahora + duracionS,
  }));
  const contenido = `${CABECERA}.${cuerpo}`;
  return `${contenido}.${firma(contenido, secreto)}`;
}

function leerJson(parte) {
  try {
    const valor = JSON.parse(Buffer.from(parte, 'base64url').toString('utf8'));
    return valor !== null && typeof valor === 'object' ? valor : null;
  } catch {
    return null;
  }
}

export function verificar(token, {
  secreto, reloj, emisor, audiencia, toleranciaS = 0,
}) {
  const partes = typeof token === 'string' ? token.split('.') : [];
  if (partes.length !== 3 || partes.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) {
    throw crear('TOKEN_INVALIDO', { motivo: 'formato' });
  }
  const [cabecera, cuerpo, recibida] = partes;
  const encabezado = leerJson(cabecera);
  // nunca se confia en el algoritmo que dice el token: solo se acepta HS256 (evita el ataque alg=none)
  if (!encabezado || encabezado.alg !== 'HS256') throw crear('TOKEN_INVALIDO', { motivo: 'algoritmo' });
  const esperada = Buffer.from(firma(`${cabecera}.${cuerpo}`, secreto));
  const dada = Buffer.from(recibida);
  if (esperada.length !== dada.length || !timingSafeEqual(esperada, dada)) {
    throw crear('TOKEN_INVALIDO', { motivo: 'firma' });
  }
  const datos = leerJson(cuerpo);
  if (!datos) throw crear('TOKEN_INVALIDO', { motivo: 'contenido' });
  if (datos.iss !== emisor || datos.aud !== audiencia) throw crear('TOKEN_INVALIDO', { motivo: 'emisor o audiencia' });
  const ahora = Math.floor(reloj().getTime() / 1000);
  if (!Number.isInteger(datos.exp) || ahora >= datos.exp + toleranciaS) throw crear('TOKEN_EXPIRADO');
  return datos;
}
