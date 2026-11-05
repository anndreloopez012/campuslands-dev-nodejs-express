import { proyectosRepository } from '../repositories/proyectos.repository.js';
import { subidasRepository } from '../repositories/subidas.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS_PROYECTO } from '../constants/archivos.js';

const configListado = {
  filtros: { estado: filtroEnum(ESTADOS_PROYECTO) },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  },
  ordenPorDefecto: 'id',
};

export const vigente = (subida, ahora = Date.now()) =>
  subida.estado === 'completada' || (subida.estado === 'pendiente' && Date.parse(subida.expiraEn) > ahora);

export function usoDelProyecto(proyectoId) {
  return subidasRepository
    .listar((subida) => subida.proyectoId === proyectoId && vigente(subida))
    .reduce((total, subida) => total + subida.tamanoBytes, 0);
}

export function obtener(id) {
  const proyecto = proyectosRepository.buscar(id);
  if (!proyecto) throw new NotFoundError(`No existe el proyecto ${id}`, 'PROYECTO_NO_ENCONTRADO');
  return proyecto;
}

const conUso = (proyecto) => {
  const usoBytes = usoDelProyecto(proyecto.id);
  return { ...proyecto, usoBytes, disponibleBytes: Math.max(proyecto.cuotaBytes - usoBytes, 0) };
};

export const obtenerConUso = (id) => conUso(obtener(id));

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { estado } = consulta.filtros;
  const filtrados = proyectosRepository
    .listar((proyecto) => estado === undefined || proyecto.estado === estado)
    .sort(consulta.comparador)
    .map(conUso);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}
