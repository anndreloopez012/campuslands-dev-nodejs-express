export const LIMITE_INTENTOS = Object.freeze({ maximo: 5, ventanaMs: 15 * 60 * 1000, bloqueoMs: 15 * 60 * 1000 });

export function crearControlIntentos({ reloj, limite = LIMITE_INTENTOS }) {
  const registros = new Map();
  const ahora = () => reloj().getTime();

  return {
    bloqueadoHasta(clave) {
      const r = registros.get(clave);
      if (!r?.bloqueadoHasta) return null;
      if (r.bloqueadoHasta <= ahora()) {
        registros.delete(clave);
        return null;
      }
      return r.bloqueadoHasta;
    },
    fallo(clave) {
      const r = registros.get(clave);
      const vigentes = (r?.fallos ?? []).filter((t) => t > ahora() - limite.ventanaMs);
      vigentes.push(ahora());
      const nuevo = { fallos: vigentes, bloqueadoHasta: null };
      if (vigentes.length >= limite.maximo) nuevo.bloqueadoHasta = ahora() + limite.bloqueoMs;
      registros.set(clave, nuevo);
      return limite.maximo - vigentes.length;
    },
    exito(clave) {
      registros.delete(clave);
    },
  };
}
