import { TIPOS } from '../constants/taller.js';
import { Cola } from '../domain/cola.js';
import { planDeTrabajos, resumirOrden } from '../domain/ordenes.js';
import { ejecutarProcesador } from '../domain/procesador.js';
import { crear } from '../errores/index.js';
import { crearRelojVirtual } from '../utils/relojVirtual.js';
import { loadJson } from '../utils/loadJson.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicios({
  reloj: relojPropio,
  relojVirtual = false,
  tipos = TIPOS,
  generarToken,
  permitirSimulaciones = true,
  trabajadores: datosDeTrabajadores = loadJson('trabajadores.json'),
} = {}) {
  const virtual = relojVirtual ? crearRelojVirtual() : null;
  const reloj = virtual ? virtual.reloj : (relojPropio ?? (() => new Date()));
  const cola = new Cola({ reloj, tipos, generarToken });
  const ordenes = new Map();
  let siguienteOrden = 1;

  const trabajador = (id) => {
    const encontrado = datosDeTrabajadores.find((t) => t.id === id);
    if (!encontrado) throw crear('TRABAJADOR_NO_ENCONTRADO', { trabajadorId: id });
    return encontrado;
  };

  const ocupadosDe = (id) => cola.listar({ estado: 'en_proceso', trabajadorId: id }).length;

  const vistaDeTrabajador = (t) => ({ ...t, habilidades: [...t.habilidades], ocupados: ocupadosDe(t.id) });

  const vistaDeOrden = (orden) => resumirOrden(orden, cola.listar({ ordenId: orden.id }));

  return {
    permitirSimulaciones,
    relojVirtual: virtual !== null,
    cola,

    trabajos: {
      encolar: (datos) => cola.encolar(datos),
      listar: ({ pagina, limite, ...filtros }) => paginar(cola.listar(filtros), pagina, limite),
      obtener: (id) => cola.obtener(id),
      completar: (id, { token, resultado }) => cola.completar(id, token, resultado),
      fallar: (id, { token, mensaje, definitivo }) => cola.fallar(id, token, { mensaje, definitivo }),
      extender: (id, { token }) => cola.extender(id, token),
      cancelar: (id) => cola.cancelar(id),
      reencolar: (id) => cola.reencolar(id),
      muertas: () => cola.listar({ estado: 'muerta' }),
    },

    trabajadores: {
      listar: () => datosDeTrabajadores.map(vistaDeTrabajador),
      obtener: (id) => vistaDeTrabajador(trabajador(id)),
      reclamar(id, { max }) {
        const mecanico = trabajador(id);
        const ocupados = ocupadosDe(id);
        const libres = mecanico.capacidad - ocupados;
        if (libres <= 0) {
          throw crear('TRABAJADOR_OCUPADO', { trabajadorId: id, ocupados, capacidad: mecanico.capacidad });
        }
        return cola.reclamar(id, { tipos: mecanico.habilidades, max: Math.min(max, libres) });
      },
    },

    ordenes: {
      crear(datos) {
        const id = siguienteOrden;
        const plan = planDeTrabajos({ ordenId: id, ...datos });
        const creados = [];
        const idPorClave = new Map();
        try {
          for (const paso of plan) {
            const { trabajo } = cola.encolar({
              tipo: paso.tipo,
              carga: paso.carga,
              prioridad: paso.prioridad,
              claveUnica: paso.claveUnica,
              dependeDe: paso.dependeDe.map((clave) => idPorClave.get(clave)),
              ordenId: id,
            });
            idPorClave.set(paso.clave, trabajo.id);
            creados.push(trabajo.id);
          }
        } catch (error) {
          for (const trabajoId of creados) {
            try {
              cola.cancelar(trabajoId);
            } catch {
              continue;
            }
          }
          throw error;
        }
        siguienteOrden += 1;
        const orden = {
          id,
          cliente: datos.cliente,
          moto: datos.moto,
          prioridad: datos.prioridad,
          creadaEn: reloj().toISOString(),
        };
        ordenes.set(id, orden);
        return vistaDeOrden(orden);
      },
      obtener(id) {
        const orden = ordenes.get(id);
        if (!orden) throw crear('ORDEN_NO_ENCONTRADA', { ordenId: id });
        return vistaDeOrden(orden);
      },
      listar: ({ pagina, limite }) => {
        const resumen = [...ordenes.values()].map((orden) => {
          const { trabajos, ...sinTrabajos } = vistaDeOrden(orden);
          return sinTrabajos;
        });
        return paginar(resumen, pagina, limite);
      },
    },

    procesador: {
      ejecutar: ({ max }) => ejecutarProcesador({ cola, trabajadores: datosDeTrabajadores, max }),
    },

    sistema: {
      estadisticas: () => cola.estadisticas(),
      reloj: () => ({ ahora: reloj().toISOString(), virtual: virtual !== null }),
      avanzarReloj(ms) {
        if (!virtual) throw crear('RELOJ_REAL');
        virtual.avanzar(ms);
        cola.listar();
        return { ahora: reloj().toISOString(), virtual: true };
      },
    },
  };
}
