import { createHmac, timingSafeEqual } from 'node:crypto';
import { NoAutenticadoError } from './errors.js';

const ALGORITMO = 'HS256';
const SEGMENTO = /^[A-Za-z0-9_-]+$/;

const codificar = (valor) => Buffer.from(JSON.stringify(valor)).toString('base64url');

const firmarTexto = (texto, secreto) => createHmac('sha256', secreto).update(texto).digest();

function decodificar(segmento) {
  try {
    const valor = JSON.parse(Buffer.from(segmento, 'base64url').toString('utf-8'));
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor) ? valor : null;
  } catch {
    return null;
  }
}

const malformado = () => new NoAutenticadoError('El token no tiene un formato JWT valido', 'TOKEN_MALFORMADO');

export function firmar(datos, { secreto, emisor, segundos, ahora = Date.now() }) {
  const emitido = Math.floor(ahora / 1000);
  const claims = { ...datos, iss: emisor, iat: emitido, exp: emitido + segundos };
  const encabezado = codificar({ alg: ALGORITMO, typ: 'JWT' });
  const cuerpo = codificar(claims);
  const firma = firmarTexto(`${encabezado}.${cuerpo}`, secreto).toString('base64url');
  return { token: `${encabezado}.${cuerpo}.${firma}`, claims };
}

export function verificar(token, { secreto, emisor, ahora = Date.now() }) {
  const partes = token.split('.');
  if (partes.length !== 3 || !partes.every((parte) => SEGMENTO.test(parte))) throw malformado();

  const [encabezadoTexto, cuerpoTexto, firmaTexto] = partes;
  const encabezado = decodificar(encabezadoTexto);
  if (!encabezado) throw malformado();
  if (encabezado.alg !== ALGORITMO) {
    throw new NoAutenticadoError(`El algoritmo ${String(encabezado.alg)} no esta permitido`, 'TOKEN_ALGORITMO_NO_PERMITIDO');
  }

  const esperada = firmarTexto(`${encabezadoTexto}.${cuerpoTexto}`, secreto);
  const recibida = Buffer.from(firmaTexto, 'base64url');
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) {
    throw new NoAutenticadoError('La firma del token no es valida', 'TOKEN_FIRMA_INVALIDA');
  }

  const claims = decodificar(cuerpoTexto);
  if (!claims || typeof claims.sub !== 'string' || !Number.isInteger(claims.exp) || !Number.isInteger(claims.iat)) {
    throw malformado();
  }
  if (claims.iss !== emisor) {
    throw new NoAutenticadoError('El emisor del token no es el esperado', 'TOKEN_EMISOR_INVALIDO');
  }
  if (claims.exp <= Math.floor(ahora / 1000)) {
    throw new NoAutenticadoError('El token expiro, inicia sesion de nuevo', 'TOKEN_EXPIRADO');
  }
  return claims;
}
