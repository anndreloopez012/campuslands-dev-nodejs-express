import { createHmac, timingSafeEqual } from 'node:crypto';
import { NoAutenticadoError } from './errors.js';

const invalido = () => new NoAutenticadoError('El token no es valido o ya vencio', 'TOKEN_INVALIDO');

export function crearTokens({ secreto, duracionSeg, reloj = () => new Date() }) {
  const firmar = (cuerpo) => createHmac('sha256', secreto).update(cuerpo).digest('base64url');
  const ahora = () => Math.floor(reloj().getTime() / 1000);

  function emitir(datos) {
    const exp = ahora() + duracionSeg;
    const cuerpo = Buffer.from(JSON.stringify({ ...datos, exp })).toString('base64url');
    return { token: `${cuerpo}.${firmar(cuerpo)}`, exp };
  }

  function verificar(token) {
    const partes = typeof token === 'string' ? token.split('.') : [];
    if (partes.length !== 2) throw invalido();
    const [cuerpo, firma] = partes;
    const esperada = Buffer.from(firmar(cuerpo));
    const recibida = Buffer.from(firma);
    if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) throw invalido();
    let datos;
    try {
      datos = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
    } catch {
      throw invalido();
    }
    if (!Number.isInteger(datos.exp) || datos.exp <= ahora()) throw invalido();
    return datos;
  }

  return { emitir, verificar };
}
