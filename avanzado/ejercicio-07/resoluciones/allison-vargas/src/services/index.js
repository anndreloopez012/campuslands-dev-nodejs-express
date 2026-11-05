import { CAPACIDAD, POLITICAS } from '../constants/cache.js';
import { Cache } from '../domain/cache.js';
import { CacheAside } from '../domain/cargador.js';
import { cotizar, resumirMarca } from '../domain/cotizacion.js';
import { Inventario } from '../domain/inventario.js';
import { crear } from '../errores/index.js';
import { crearRelojVirtual } from '../utils/relojVirtual.js';
import { loadJson } from '../utils/loadJson.js';
import { paginar } from '../utils/paginacion.js';

const claveDeLista = (filtros) => {
  const ordenado = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)));
  return `autos:lista:${JSON.stringify(ordenado)}`;
};

export function crearServicios({
  reloj: relojPropio,
  relojVirtual = false,
  capacidad = CAPACIDAD,
  politicas = POLITICAS,
  autos = loadJson('autos.json'),
  espera,
} = {}) {
  const virtual = relojVirtual ? crearRelojVirtual() : null;
  const reloj = virtual ? virtual.reloj : (relojPropio ?? (() => new Date()));
  const cache = new Cache({ reloj, capacidad });
  const aside = new CacheAside({ cache });
  const inventario = new Inventario({ autos, espera });

  const conCache = (clave, politica, cargar, etiquetas, modo) => aside.obtener(
    clave,
    cargar,
    { ...politica, etiquetas, ttlAusenteMs: politicas.ausente.ttlMs },
    modo,
  );

  const leerAuto = async (id, modo) => {
    const resultado = await conCache(`auto:${id}`, politicas.auto, () => inventario.leer(id), [`auto:${id}`], modo);
    if (resultado.ausente) throw crear('AUTO_NO_ENCONTRADO', { autoId: id });
    return resultado;
  };

  const invalidar = (...etiquetas) => etiquetas.reduce((total, etiqueta) => total + cache.invalidarEtiqueta(etiqueta), 0);

  return {
    relojVirtual: virtual !== null,
    cache,

    autos: {
      async listar({ pagina, limite, ...filtros }, modo) {
        const clave = claveDeLista(filtros);
        const resultado = await conCache(clave, politicas.lista, () => inventario.listar(filtros), ['listados'], modo);
        return { ...paginar(resultado.valor, pagina, limite), estado: resultado.estado, restanteMs: resultado.restanteMs };
      },

      async obtener(id, modo) {
        const { valor, estado, restanteMs } = await leerAuto(id, modo);
        return { data: valor, estado, restanteMs };
      },

      async cotizar(id, opciones, modo) {
        const clave = `cotizacion:${id}:${opciones.moneda}:${opciones.anticipoPorcentaje}:${opciones.meses}`;
        const resultado = await conCache(
          clave,
          politicas.cotizacion,
          async () => cotizar((await leerAuto(id, 'normal')).valor, opciones),
          [`auto:${id}`],
          modo,
        );
        return { data: resultado.valor, estado: resultado.estado, restanteMs: resultado.restanteMs };
      },

      async crear(datos) {
        const auto = await inventario.crear(datos);
        invalidar(`auto:${auto.id}`, 'listados', `marca:${auto.marca.toLowerCase()}`);
        return auto;
      },

      async actualizar(id, cambios) {
        const { anterior, actual } = await inventario.actualizar(id, cambios);
        invalidar(`auto:${id}`, 'listados', `marca:${anterior.marca.toLowerCase()}`, `marca:${actual.marca.toLowerCase()}`);
        return actual;
      },

      async eliminar(id) {
        const auto = await inventario.eliminar(id);
        invalidar(`auto:${id}`, 'listados', `marca:${auto.marca.toLowerCase()}`);
      },
    },

    marcas: {
      async resumen(marca, modo) {
        const resultado = await conCache(
          `marca:${marca.toLowerCase()}:resumen`,
          politicas.resumen,
          async () => {
            const delaMarca = await inventario.autosDeMarca(marca);
            return delaMarca.length === 0 ? null : resumirMarca(delaMarca[0].marca, delaMarca);
          },
          [`marca:${marca.toLowerCase()}`],
          modo,
        );
        if (resultado.ausente) throw crear('MARCA_NO_ENCONTRADA', { marca });
        return { data: resultado.valor, estado: resultado.estado, restanteMs: resultado.restanteMs };
      },
    },

    admin: {
      estadisticas: () => ({ cache: cache.estadisticas(), cargas: aside.estadisticas(), fuente: inventario.lecturas() }),
      claves: (filtros) => cache.claves(filtros),
      vaciar: () => cache.vaciar(),
      purgar: () => cache.purgar(),
      invalidarEtiqueta: (etiqueta) => cache.invalidarEtiqueta(etiqueta),
      borrarClave(clave) {
        if (!cache.borrar(clave)) throw crear('CLAVE_NO_ENCONTRADA', { clave });
      },
      esperarRefrescos: () => aside.esperarRefrescos(),
    },

    sistema: {
      reloj: () => ({ ahora: reloj().toISOString(), virtual: virtual !== null }),
      avanzarReloj(ms) {
        if (!virtual) throw crear('RELOJ_REAL');
        virtual.avanzar(ms);
        return { ahora: reloj().toISOString(), virtual: true };
      },
    },
  };
}
