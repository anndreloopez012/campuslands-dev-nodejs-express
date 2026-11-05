import { LIMITES } from '../constants/csv.js';
import { crear } from '../errores/index.js';
import { detectarDelimitador, parsearCsv } from '../domain/csv.js';
import { analizarEncabezados, exigirEncabezados } from '../domain/encabezados.js';
import { claveDePartido } from '../domain/almacen.js';
import { decodificar } from '../domain/texto.js';
import { resolverDelimitador, validarFila } from '../validators/partido.js';

const esFilaVacia = (fila) => fila.campos.every((c) => c.trim() === '');

function leerRegistros(buffer, charset, nombreDelimitador) {
  const { texto, bom, codificacion } = decodificar(buffer, charset);
  if (texto.trim() === '') throw crear('CSV_VACIO');
  const elegido = resolverDelimitador(nombreDelimitador);
  const delimitador = elegido ?? detectarDelimitador(texto);
  const registros = parsearCsv(texto, { delimitador, maxRegistros: LIMITES.registros }).filter((r) => !esFilaVacia(r));
  return {
    registros, delimitador, detectado: elegido === null, bom, codificacion,
  };
}

export function crearImportador({ almacen, reloj }) {
  const hoy = () => reloj().toISOString().slice(0, 10);

  function procesar(lectura, modo) {
    const [cabecera, ...filas] = lectura.registros;
    if (!cabecera || filas.length === 0) throw crear('CSV_VACIO');
    const analisis = exigirEncabezados(cabecera.campos);
    const columnas = cabecera.campos.length;
    const limite = hoy();
    const validos = [];
    const errores = [];
    const duplicadas = [];
    const vistos = new Set();
    let rechazadas = 0;

    for (const fila of filas) {
      if (fila.campos.length !== columnas) {
        rechazadas += 1;
        errores.push({ fila: fila.linea, errores: [{ campo: 'fila', mensaje: `tiene ${fila.campos.length} columnas y el encabezado tiene ${columnas}` }] });
        continue;
      }
      const objeto = {};
      for (const [nombre, posicion] of analisis.indices) objeto[nombre] = fila.campos[posicion];
      const resultado = validarFila(objeto, { hoy: limite });
      if (resultado.errores) {
        rechazadas += 1;
        errores.push({ fila: fila.linea, errores: resultado.errores });
        continue;
      }
      const clave = claveDePartido(resultado.valor);
      if (almacen.existe(resultado.valor) || vistos.has(clave)) {
        duplicadas.push(fila.linea);
        continue;
      }
      vistos.add(clave);
      validos.push(resultado.valor);
    }

    if (modo === 'estricto' && rechazadas > 0) {
      throw crear('IMPORTACION_RECHAZADA', { rechazadas, leidas: filas.length }, { detalles: errores.slice(0, LIMITES.erroresReportados) });
    }

    return {
      partidos: validos,
      resumen: {
        delimitador: lectura.delimitador,
        delimitadorDetectado: lectura.detectado,
        codificacion: lectura.codificacion,
        bom: lectura.bom,
        columnas: [...analisis.indices.keys()],
        columnasIgnoradas: analisis.ignoradas,
        filasLeidas: filas.length,
        validas: validos.length,
        duplicadas: duplicadas.length,
        rechazadas,
        filasDuplicadas: duplicadas.slice(0, LIMITES.erroresReportados),
        errores: errores.slice(0, LIMITES.erroresReportados),
        erroresOmitidos: Math.max(0, errores.length - LIMITES.erroresReportados),
      },
    };
  }

  return {
    importar(buffer, { charset, delimitador, modo, dryRun, nombre, origen = 'carga' }) {
      const { partidos, resumen } = procesar(leerRegistros(buffer, charset, delimitador), modo);
      const base = { ...resumen, modo, nombre, origen };
      if (dryRun) return { dryRun: true, ...base, guardadas: 0 };
      const importacion = almacen.registrar({
        resumen: { ...base, guardadas: partidos.length, creadaEn: reloj().toISOString() },
        partidos,
      });
      return { dryRun: false, ...importacion };
    },

    analizar(buffer, { charset, delimitador }) {
      const lectura = leerRegistros(buffer, charset, delimitador);
      const [cabecera, ...filas] = lectura.registros;
      const analisis = analizarEncabezados(cabecera.campos);
      const columnas = cabecera.campos.length;
      return {
        delimitador: lectura.delimitador,
        delimitadorDetectado: lectura.detectado,
        codificacion: lectura.codificacion,
        bom: lectura.bom,
        encabezados: cabecera.campos.map((c) => c.trim()),
        columnasReconocidas: [...analisis.indices.keys()],
        columnasIgnoradas: analisis.ignoradas,
        columnasFaltantes: analisis.faltantes,
        columnasDuplicadas: analisis.duplicadas,
        filas: filas.length,
        filasConColumnasDistintas: filas.filter((f) => f.campos.length !== columnas).map((f) => f.linea).slice(0, LIMITES.erroresReportados),
        vistaPrevia: filas.slice(0, LIMITES.vistaPrevia).map((f) => ({ linea: f.linea, campos: f.campos })),
        listoParaImportar: analisis.faltantes.length === 0 && analisis.duplicadas.length === 0 && !analisis.conPuntos && filas.length > 0,
      };
    },
  };
}
