import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { LIMITES } from '../constants/combates.js';
import { crear, esErrorDeNegocio } from '../errores/index.js';
import { construirFiltro, filtrar, tomar } from '../domain/filtros.js';
import {
  ACsv, AcumuladorDeImportacion, AgregadorDeEstadisticas, ANdjson, DeLineas, LimitadorDeBytes, ValidadorDeLineas,
} from '../domain/streams.js';
import { validarCombate } from '../validators/combates.js';

const TIPOS = {
  ndjson: { contentType: 'application/x-ndjson; charset=utf-8', extension: 'ndjson', transformador: () => new ANdjson() },
  csv: { contentType: 'text/csv; charset=utf-8', extension: 'csv', transformador: () => new ACsv() },
};

export function crearServicioCombates({ fuente, peleadores }) {
  const porId = new Map(peleadores.map((p) => [p.id, p]));
  const nombres = new Map(peleadores.map((p) => [p.id, p.nombre]));

  const seleccion = (filtros) => filtrar(fuente.recorrer(), construirFiltro(filtros));

  return {
    obtener(id) {
      const combate = fuente.obtener(id);
      if (!combate) throw crear('COMBATE_NO_ENCONTRADO', { combateId: id });
      return combate;
    },

    async listar({ pagina, limite, filtros }) {
      const inicio = (pagina - 1) * limite;
      const data = [];
      let total = 0;
      for await (const combate of seleccion(filtros)) {
        if (total >= inicio && data.length < limite) data.push(combate);
        total += 1;
      }
      return {
        data,
        paginacion: { pagina, limite, total, totalPaginas: Math.max(1, Math.ceil(total / limite)) },
      };
    },

    abrirExportacion({ formato, limite, filtros }) {
      const tipo = TIPOS[formato];
      const origen = Readable.from(tomar(seleccion(filtros), limite), { objectMode: true, highWaterMark: LIMITES.bufferDeObjetos });
      const salida = tipo.transformador();
      return {
        contentType: tipo.contentType,
        nombreArchivo: `combates.${tipo.extension}`,
        origen,
        transformador: salida,
      };
    },

    async estadisticas({ filtros }) {
      const agregador = new AgregadorDeEstadisticas();
      await pipeline(Readable.from(seleccion(filtros), { objectMode: true, highWaterMark: LIMITES.bufferDeObjetos }), agregador);
      return agregador.resumen(nombres);
    },

    async importar(flujo, { modo }) {
      const acumulador = new AcumuladorDeImportacion({ maxErrores: LIMITES.erroresReportados });
      try {
        await pipeline(
          flujo,
          new LimitadorDeBytes(LIMITES.importacionBytes),
          new DeLineas({ maxima: LIMITES.lineaCaracteres }),
          new ValidadorDeLineas((dato) => validarCombate(dato, porId)),
          acumulador,
        );
      } catch (error) {
        if (esErrorDeNegocio(error)) throw error;
        if (error?.code === 'ERR_STREAM_PREMATURE_CLOSE') throw crear('CARGA_INTERRUMPIDA', {}, { causa: error });
        throw error;
      }
      if (acumulador.recibidas === 0) throw crear('IMPORTACION_VACIA');
      if (modo === 'estricto' && acumulador.rechazadas > 0) {
        throw crear('IMPORTACION_RECHAZADA', { rechazadas: acumulador.rechazadas, recibidas: acumulador.recibidas }, {
          detalles: acumulador.errores,
        });
      }
      const rango = fuente.importar(acumulador.validas);
      return {
        modo,
        recibidas: acumulador.recibidas,
        guardadas: acumulador.validas.length,
        rechazadas: acumulador.rechazadas,
        rango,
        errores: acumulador.errores,
        erroresOmitidos: Math.max(0, acumulador.rechazadas - acumulador.errores.length),
        totalCombates: fuente.cantidad,
      };
    },
  };
}
