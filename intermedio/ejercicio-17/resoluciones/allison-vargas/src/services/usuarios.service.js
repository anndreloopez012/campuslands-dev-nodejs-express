import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { toursRepository } from '../repositories/tours.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ROLES } from '../constants/permisos.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';

const ordenes = {
  id: (a, b) => a.id - b.id,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre) || a.id - b.id,
};

const configListado = {
  filtros: { rol: filtroEnum(ROLES) },
  ordenes,
  ordenPorDefecto: 'id',
};

export function obtener(id) {
  const usuario = usuariosRepository.buscar(id);
  if (!usuario) throw new NotFoundError(`No existe el usuario ${id}`, 'USUARIO_NO_ENCONTRADO');
  return usuarioPublico(usuario);
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { rol } = consulta.filtros;
  const filtrados = usuariosRepository
    .listar((usuario) => rol === undefined || usuario.rol === rol)
    .sort(consulta.comparador)
    .map(usuarioPublico);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function cambiarRol(actor, id, { rol }) {
  const objetivo = obtener(id);
  if (objetivo.id === actor.id) {
    throw new ConflictError('No puedes cambiar tu propio rol', 'ACCION_SOBRE_SI_MISMO');
  }
  if (objetivo.rol === 'guia' && rol !== 'guia' && toursRepository.listar((tour) => tour.guiaId === id).length) {
    throw new ConflictError('El guia tiene tours asignados, reasignalos primero', 'GUIA_CON_TOURS');
  }
  return usuarioPublico(usuariosRepository.actualizar(id, { rol }));
}
