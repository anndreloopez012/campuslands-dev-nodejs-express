import { paginar } from '../utils/paginacion.js';
import { leerListado } from '../validators/consulta.js';

const configListado = {
  ordenes: { reciente: () => 0 },
  ordenPorDefecto: 'reciente',
  limiteDefault: 20,
  limiteMax: 50,
};

export function crearEventosService({ bitacora }) {
  function listar(query) {
    const consulta = leerListado(query, configListado);
    return paginar(bitacora.recientes(), consulta.pagina, consulta.limite);
  }

  return { listar };
}
