import { crear } from '../errores/index.js';

const canonico = (valor) => {
  if (Array.isArray(valor)) return valor.map(canonico);
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.keys(valor).sort().map((clave) => [clave, canonico(valor[clave])]));
  }
  return valor;
};

export const huellaDe = (cuerpo) => JSON.stringify(canonico(cuerpo));

export async function conIdempotencia(tx, clave, cuerpo, operacion) {
  if (!clave) return { respuesta: await operacion(), repetida: false };
  const huella = huellaDe(cuerpo);
  const previa = tx.leer('idempotencia', clave);
  if (previa) {
    if (previa.huella !== huella) throw crear('IDEMPOTENCIA_CONFLICTO', { clave });
    return { respuesta: previa.respuesta, repetida: true };
  }
  const respuesta = await operacion();
  tx.insertar('idempotencia', { huella, respuesta }, clave);
  return { respuesta, repetida: false };
}
