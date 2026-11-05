import { COLUMNAS } from '../constants/csv.js';
import { crear } from '../errores/index.js';
import { escribirCsv } from '../domain/csv.js';
import { normalizarClave } from '../domain/texto.js';
import { paginar } from '../utils/paginacion.js';

function aplicarFiltros(partidos, { jugador, torneo, desde, hasta, importacionId }) {
  const claveJugador = jugador ? normalizarClave(jugador) : null;
  const claveTorneo = torneo ? normalizarClave(torneo) : null;
  return partidos.filter((p) => (!claveJugador || normalizarClave(p.local) === claveJugador || normalizarClave(p.visita) === claveJugador)
    && (!claveTorneo || normalizarClave(p.torneo) === claveTorneo)
    && (!desde || p.fecha >= desde)
    && (!hasta || p.fecha <= hasta)
    && (importacionId === undefined || p.importacionId === importacionId));
}

const masRecientes = (a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.id - a.id);

export function crearServicioPartidos({ almacen }) {
  return {
    listar({ pagina, limite, filtros }) {
      const lista = aplicarFiltros(almacen.partidos, filtros).sort(masRecientes);
      return paginar(lista, pagina, limite);
    },

    obtener(id) {
      const partido = almacen.obtenerPartido(id);
      if (!partido) throw crear('PARTIDO_NO_ENCONTRADO', { partidoId: id });
      return partido;
    },

    exportar({ delimitador, bom, filtros }) {
      const lista = aplicarFiltros(almacen.partidos, filtros).sort((a, b) => a.id - b.id);
      return { texto: escribirCsv(COLUMNAS, lista, { delimitador, bom }), filas: lista.length };
    },
  };
}
