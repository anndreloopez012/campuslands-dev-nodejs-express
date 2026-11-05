import { crear } from '../errores/index.js';
import { paginar } from '../utils/paginacion.js';

const resumir = ({ errores, filasDuplicadas, ...resto }) => resto;

export function crearServicioImportaciones({ almacen }) {
  const buscar = (id) => {
    const importacion = almacen.obtenerImportacion(id);
    if (!importacion) throw crear('IMPORTACION_NO_ENCONTRADA', { importacionId: id });
    return importacion;
  };

  return {
    listar({ pagina, limite }) {
      const { data, paginacion } = paginar([...almacen.importaciones].reverse(), pagina, limite);
      return { data: data.map(resumir), paginacion };
    },

    obtener: (id) => buscar(id),

    revertir(id) {
      const importacion = buscar(id);
      if (importacion.revertida) throw crear('IMPORTACION_YA_REVERTIDA', { importacionId: id });
      const partidosEliminados = almacen.revertir(id);
      return { importacion: resumir(importacion), partidosEliminados };
    },
  };
}
