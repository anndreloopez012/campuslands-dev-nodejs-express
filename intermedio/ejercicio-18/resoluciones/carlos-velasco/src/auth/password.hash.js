const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

/**
 * Hash de contrasenas sin bcrypt: scrypt nativo de node:crypto.
 *
 * Formato almacenado:
 *   scrypt:<N>:<r>:<p>:<saltHex>:<hashHex>
 *
 * Reglas del diseno:
 * - El salt nunca se reutiliza y se guarda junto al hash (128 bits por usuario).
 * - La comparacion es en tiempo constante (timingSafeEqual).
 * - El formato de almacenamiento incluye los parametros para poder subirlos en el futuro
 *   sin recomputar hashes antiguos (migracion gradual).
 */
const N = 16384; // coste CPU/memoria
const R = 8;     // factor de bloque
const P = 1;     // paralelismo

function hash(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length < 8) {
    throw new Error('La contrasena debe ser un string de al menos 8 caracteres');
  }

  const salt = randomBytes(16);
  const hashDerivado = scryptSync(contrasena, salt, 64, { N, r: R, p: P });

  return `scrypt:${N}:${R}:${P}:${salt.toString('hex')}:${hashDerivado.toString('hex')}`;
}

function verificar(contrasena, hashAlmacenado) {
  if (typeof contrasena !== 'string' || typeof hashAlmacenado !== 'string') return false;

  const [algoritmo, nAlmac, rAlmac, pAlmac, saltHex, hashHex] = hashAlmacenado.split(':');
  if (algoritmo !== 'scrypt') return false;

  const salt = Buffer.from(saltHex, 'hex');
  const hashEsperado = Buffer.from(hashHex, 'hex');

  const hashRecibido = scryptSync(contrasena, salt, hashEsperado.length, {
    N: Number(nAlmac),
    r: Number(rAlmac),
    p: Number(pAlmac)
  });

  if (hashRecibido.length !== hashEsperado.length) return false;
  return timingSafeEqual(hashRecibido, hashEsperado);
}

/** Puntuacion simple de robustez para devolver feedback en el registro. */
function robustez(contrasena) {
  let puntaje = 0;
  if (contrasena.length >= 8) puntaje += 1;
  if (contrasena.length >= 12) puntaje += 1;
  if (/[a-z]/.test(contrasena) && /[A-Z]/.test(contrasena)) puntaje += 1;
  if (/\d/.test(contrasena)) puntaje += 1;
  if (/[^A-Za-z0-9]/.test(contrasena)) puntaje += 1;
  // etiquetas descriptivas del nivel alcanzado
  if (puntaje <= 2) return { nivel: 'debil', puntaje };
  if (puntaje <= 4) return { nivel: 'media', puntaje };
  return { nivel: 'fuerte', puntaje };
}

module.exports = { hash, verificar, robustez };
