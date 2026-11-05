import { crearServicios } from '../src/services/index.js';
import { crearReloj } from './datos.js';

export function crearEntorno(opciones = {}) {
  const tiempo = crearReloj();
  const servicios = crearServicios({ reloj: tiempo.reloj, ...opciones });
  return { ...tiempo, servicios, almacen: servicios.almacen };
}

export const fichaje = (jugadorId, clubDestinoId, precio, extra = {}) => ({
  jugadorId,
  clubDestinoId,
  precio,
  ...extra,
});

export const rechazaCon = (codigo, contexto) => (error) => {
  if (error?.codigo !== codigo) return false;
  if (contexto) {
    for (const [clave, valor] of Object.entries(contexto)) {
      if (error.contexto[clave] !== valor) return false;
    }
  }
  return true;
};
