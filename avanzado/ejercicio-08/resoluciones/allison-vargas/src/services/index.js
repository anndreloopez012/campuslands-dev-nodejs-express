import { LIMITES, UMBRALES } from '../constants/eventos.js';
import { BusDeEventos } from '../domain/bus.js';
import { Buzones } from '../domain/buzones.js';
import { instalarReacciones } from '../domain/reacciones.js';
import { Records } from '../domain/records.js';
import { Sesiones } from '../domain/sesiones.js';
import { crear } from '../errores/index.js';
import { loadJson } from '../utils/loadJson.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicios({
  reloj = () => new Date(),
  circuitos = loadJson('circuitos.json'),
  autos = loadJson('autos.json'),
  umbrales = UMBRALES,
  limites = LIMITES,
} = {}) {
  const bus = new BusDeEventos({
    reloj,
    maxPorEvento: limites.maxPorEvento,
    profundidadMaxima: limites.profundidadMaxima,
    capacidadHistorial: limites.capacidadHistorial,
  });
  const records = new Records(circuitos);
  const sesiones = new Sesiones({ bus, reloj, autos, maxVueltas: limites.maxVueltas });
  const buzones = new Buzones({ bus, reloj, maximo: limites.maxBuzones });
  instalarReacciones({ bus, sesiones, records, umbrales });

  return {
    bus,
    circuitos,
    autos,

    catalogo: {
      circuitos: () => circuitos.map((c) => ({ ...c, record: records.actual(c.id) })),
      autos: () => autos,
      records: () => records.todos(),
    },

    sesiones: {
      crear: (datos) => sesiones.crear(datos),
      listar: ({ pagina, limite, ...filtros }) => paginar(sesiones.listar(filtros), pagina, limite),
      obtener: (id) => sesiones.obtener(id),
      registrarVuelta: (id, datos) => sesiones.registrarVuelta(id, datos),
      finalizar: (id, { motivo }) => sesiones.finalizar(id, motivo),
      abortar: (id, { motivo = 'abortada por el equipo' }) => sesiones.abortar(id, motivo),
    },

    eventos: {
      consultar: (filtros) => bus.consultar(filtros),
      obtener(seq) {
        const evento = bus.obtenerEvento(seq);
        if (!evento) throw crear('EVENTO_NO_ENCONTRADO', { seq });
        return evento;
      },
      transmitir({ eventos, desde }, enviar) {
        const suscripcion = bus.suscribir('*', (envoltorio) => {
          if (!eventos || eventos.includes(envoltorio.evento)) enviar(envoltorio);
        }, { nombre: 'transmision' });
        return {
          repetir() {
            if (desde === undefined) return;
            const { data } = bus.consultar({ desde, limite: 100 });
            for (const envoltorio of data) {
              if (!eventos || eventos.includes(envoltorio.evento)) enviar(envoltorio);
            }
          },
          cerrar: () => suscripcion.cancelar(),
        };
      },
    },

    buzones: {
      crear: (datos) => buzones.crear(datos),
      listar: () => buzones.listar(),
      obtener: (id) => buzones.obtener(id),
      vaciar: (id) => buzones.vaciar(id),
      eliminar: (id) => buzones.eliminar(id),
    },

    sistema: {
      estadisticas: () => bus.estadisticas(),
      suscripciones: (filtros) => bus.suscripciones(filtros),
      fallos: () => bus.fallos(),
    },
  };
}
