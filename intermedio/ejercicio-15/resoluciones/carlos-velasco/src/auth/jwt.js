const { createHmac, timingSafeEqual } = require('node:crypto');

const SEGUNDOS_POR_HORA = 3600;

/**
 * JWT minimo (HS256) implementado con crypto nativo.
 * Formato: base64url(header).base64url(payload).base64url(hmac)
 */
function base64url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function desdeBase64url(texto) {
  const normalizado = texto.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalizado, 'base64').toString('utf8');
}

function firmar(payload, secreto, { expiraEnSegundos = 2 * SEGUNDOS_POR_HORA } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const ahora = Math.floor(Date.now() / 1000);
  const payloadConMetadatos = {
    ...payload,
    iat: ahora,
    exp: ahora + expiraEnSegundos
  };

  const parteHeader = base64url(JSON.stringify(header));
  const partePayload = base64url(JSON.stringify(payloadConMetadatos));
  
  const firma = createHmac('sha256', secreto).update(`${parteHeader}.${partePayload}`).digest();

  return `${parteHeader}.${partePayload}.${base64url(firma)}`;
}

/**
 * Verifica firma y expiracion.
 * Devuelve { valido, payload, error }: nunca lanza, para decidir en el middleware.
 */
function verificar(token, secreto) {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    return { valido: false, error: 'Token malformado' };
  }

  const [parteHeader, partePayload, firmaTexto] = token.split('.');

  const firmaEsperada = createHmac('sha256', secreto)
    .update(`${parteHeader}.${partePayload}`)
    .digest();
  const firmaRecibida = Buffer.from(desdeBase64url(firmaTexto));

  // comparacion en tiempo constante: evita leaked timing
  if (firmaRecibida.length !== firmaEsperada.length || !timingSafeEqual(firmaRecibida, firmaEsperada)) {
    return { valido: false, error: 'Firma invalida' };
  }

  let payload;
  try {
    payload = JSON.parse(desdeBase64url(partePayload));
  } catch {
    return { valido: false, error: 'Payload invalido' };
  }

  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    return { valido: false, error: 'Token expirado' };
  }

  return { valido: true, payload };
}

module.exports = { firmar, verificar };
