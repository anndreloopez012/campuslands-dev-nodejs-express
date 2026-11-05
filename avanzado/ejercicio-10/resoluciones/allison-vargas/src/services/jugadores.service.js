import { crear } from '../errores/index.js';
import { enfrentamientos, partidosDe, ranking, resumenDe } from '../domain/estadisticas.js';

const masRecientes = (a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.id - a.id);

export function crearServicioJugadores({ almacen }) {
  return {
    ranking: (opciones) => ranking(almacen.partidos, opciones),

    historial(nombre) {
      const resumen = resumenDe(almacen.partidos, nombre);
      if (!resumen) throw crear('JUGADOR_NO_ENCONTRADO', { nombre });
      return { resumen, ultimosPartidos: partidosDe(almacen.partidos, nombre).sort(masRecientes).slice(0, 10) };
    },

    enfrentamientos(a, b) {
      const { resultado, comunes } = enfrentamientos(almacen.partidos, a, b);
      return { ...resultado, partidosJugados: comunes.sort(masRecientes).slice(0, 10) };
    },
  };
}
