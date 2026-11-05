import { createHash } from 'node:crypto';
import { crear } from '../errores/index.js';

export const PATRON_CLAVE = /^[A-Za-z0-9_-]{8,64}$/;
const CABECERAS_A_REPETIR = ['location', 'content-type'];

export function canonico(valor) {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  if (valor !== null && typeof valor === 'object') {
    return `{${Object.keys(valor).sort().map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(',')}}`;
  }
  return JSON.stringify(valor) ?? 'null';
}

// la huella identifica "la misma peticion": metodo, ruta y body (sin importar el orden de las claves)
export const huellaDe = (req) => createHash('sha256')
  .update(`${req.method} ${req.baseUrl}${req.path}\n${canonico(req.body ?? null)}`)
  .digest('hex');

export const idempotente = ({ almacen }) => (req, res, next) => {
  const cliente = req.cliente;
  const clave = req.get('idempotency-key');
  if (clave === undefined) return next(crear('CLAVE_IDEMPOTENCIA_REQUERIDA'));
  if (!PATRON_CLAVE.test(clave)) return next(crear('CLAVE_IDEMPOTENCIA_INVALIDA'));

  const huella = huellaDe(req);
  const previo = almacen.obtener(cliente, clave);
  if (previo) {
    if (previo.huella !== huella) return next(crear('CLAVE_REUTILIZADA'));
    if (previo.estado === 'en_proceso') {
      return next(crear('PETICION_EN_CURSO', {}, { cabeceras: { 'Retry-After': '1' } }));
    }
    const { status, cabeceras, cuerpo } = previo.respuesta;
    res.set(cabeceras).set({ 'Idempotent-Replayed': 'true', 'Idempotency-Key': clave });
    return res.status(status).send(cuerpo);
  }

  almacen.reservar(cliente, clave, huella);
  res.set('Idempotency-Key', clave);
  const enviar = res.send.bind(res);
  let resuelto = false;

  res.send = (cuerpo) => {
    if (!resuelto) {
      resuelto = true;
      if (res.statusCode >= 500) {
        // un error del servidor no es "la respuesta" a la operacion: se libera la clave para reintentar
        almacen.liberar(cliente, clave);
      } else {
        const cabeceras = {};
        for (const nombre of CABECERAS_A_REPETIR) {
          const valor = res.get(nombre);
          if (valor !== undefined) cabeceras[nombre] = valor;
        }
        almacen.completar(cliente, clave, { status: res.statusCode, cabeceras, cuerpo: Buffer.isBuffer(cuerpo) ? cuerpo.toString() : cuerpo });
      }
    }
    return enviar(cuerpo);
  };
  res.on('close', () => {
    if (!resuelto) {
      resuelto = true;
      almacen.liberar(cliente, clave);
    }
  });
  return next();
};
