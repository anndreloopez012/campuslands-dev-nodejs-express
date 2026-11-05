import { createHash } from 'node:crypto';
import { LIMITES } from '../constants/peliculas.js';
import { crear } from '../errores/index.js';
import { paginar } from '../utils/paginacion.js';

const publica = ({ contenido, ...resto }) => resto;

export function crearServicioExportaciones({ peliculas, reloj }) {
  const guardadas = [];
  let siguienteId = 1;

  const buscar = (id) => {
    const exportacion = guardadas.find((e) => e.id === id);
    if (!exportacion) throw crear('EXPORTACION_NO_ENCONTRADA', { exportacionId: id });
    return exportacion;
  };

  return {
    crear(parametros) {
      if (guardadas.length >= LIMITES.instantaneas) throw crear('EXPORTACION_LIMITE', { maximo: LIMITES.instantaneas });
      const abierta = peliculas.abrirExportacion(parametros);
      const trozos = [];
      let bytes = 0;
      for (const trozo of abierta.trozos()) {
        const buffer = Buffer.from(trozo, 'utf8');
        bytes += buffer.length;
        if (bytes > LIMITES.bytesInstantanea) throw crear('EXPORTACION_DEMASIADO_GRANDE', { maximoBytes: LIMITES.bytesInstantanea });
        trozos.push(buffer);
      }
      const contenido = Buffer.concat(trozos);
      const digest = createHash('sha256').update(contenido).digest();
      const exportacion = {
        id: siguienteId,
        nombre: parametros.nombre,
        creadaEn: reloj().toISOString(),
        forma: parametros.forma,
        registros: abierta.total,
        bytes: contenido.length,
        sha256: digest.toString('hex'),
        versionDelCatalogo: abierta.version,
        contentType: abierta.contentType,
        nombreArchivo: abierta.nombreArchivo,
        contenido,
        digest: `sha-256=${digest.toString('base64')}`,
      };
      siguienteId += 1;
      guardadas.push(exportacion);
      return publica(exportacion);
    },

    listar({ pagina, limite }) {
      const { data, paginacion } = paginar([...guardadas].reverse().map(publica), pagina, limite);
      return { data, paginacion };
    },

    obtener: (id) => publica(buscar(id)),

    descargar: (id) => buscar(id),

    eliminar(id) {
      const exportacion = buscar(id);
      guardadas.splice(guardadas.indexOf(exportacion), 1);
      return publica(exportacion);
    },
  };
}
