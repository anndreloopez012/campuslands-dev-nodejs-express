import { tatuadoresRepository } from '../repositories/tatuadores.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { ESTILOS } from '../constants/citas.js';

const configListado = {
  filtros: { estilo: filtroEnum(ESTILOS), activo: filtroBooleano },
  ordenes: { nombre: (a, b) => a.nombre.localeCompare(b.nombre), id: (a, b) => a.id - b.id },
  ordenPorDefecto: 'id',
};

export function obtener(id) {
  const tatuador = tatuadoresRepository.buscar(id);
  if (!tatuador) throw new NotFoundError(`No existe el tatuador ${id}`, 'TATUADOR_NO_ENCONTRADO');
  return tatuador;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { estilo, activo } = consulta.filtros;
  const filtrados = tatuadoresRepository
    .listar((tatuador) =>
      (estilo === undefined || tatuador.estilos.includes(estilo))
      && (activo === undefined || tatuador.activo === activo))
    .sort(consulta.comparador);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}
