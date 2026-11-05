export const POLITICA = Object.freeze({
  vigenciaMs: 24 * 60 * 60 * 1000,
  bloqueoMaximoMs: 30 * 1000,
});

// guarda, por cliente y clave, la huella de la peticion original y la respuesta que se dio
export function crearAlmacenIdempotencia({ reloj, politica = POLITICA }) {
  const registros = new Map();
  const ahora = () => reloj().getTime();
  const id = (cliente, clave) => `${cliente}\u0000${clave}`;

  function vigente(registro) {
    if (!registro) return null;
    if (registro.expiraEn <= ahora()) return null;
    // si un proceso quedo colgado mas de lo razonable se libera para que el cliente pueda reintentar
    if (registro.estado === 'en_proceso' && registro.creadoEn + politica.bloqueoMaximoMs <= ahora()) return null;
    return registro;
  }

  return {
    obtener(cliente, clave) {
      const registro = vigente(registros.get(id(cliente, clave)));
      if (!registro) registros.delete(id(cliente, clave));
      return registro;
    },

    reservar(cliente, clave, huella) {
      const registro = {
        cliente, clave, huella, estado: 'en_proceso', creadoEn: ahora(), expiraEn: ahora() + politica.vigenciaMs, respuesta: null,
      };
      registros.set(id(cliente, clave), registro);
      return registro;
    },

    completar(cliente, clave, respuesta) {
      const registro = registros.get(id(cliente, clave));
      if (!registro) return;
      registro.estado = 'completada';
      registro.respuesta = respuesta;
      registro.completadoEn = ahora();
    },

    liberar(cliente, clave) {
      registros.delete(id(cliente, clave));
    },

    purgar() {
      let borrados = 0;
      for (const [llave, registro] of registros) {
        if (!vigente(registro)) {
          registros.delete(llave);
          borrados += 1;
        }
      }
      return borrados;
    },

    get tamano() { return registros.size; },
  };
}
