import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { sesionesRepository } from '../repositories/sesiones.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { leerListado, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { ROLES } from '../constants/roles.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  nombre: (a, b) => collator.compare(a.nombre, b.nombre) || a.id - b.id,
  email: (a, b) => collator.compare(a.email, b.email),
  creado: (a, b) => b.creadoEn.localeCompare(a.creadoEn) || a.id - b.id,
};

const configListado = {
  filtros: { rol: filtroEnum(ROLES), activo: filtroBooleano },
  ordenes,
  ordenPorDefecto: 'nombre',
};

export function obtener(id) {
  const usuario = usuariosRepository.buscar(id);
  if (!usuario) throw new NotFoundError(`No existe el usuario ${id}`, 'USUARIO_NO_ENCONTRADO');
  return usuarioPublico(usuario);
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { rol, activo } = consulta.filtros;

  const filtrados = usuariosRepository
    .listar((usuario) => (rol === undefined || usuario.rol === rol) && (activo === undefined || usuario.activo === activo))
    .map(usuarioPublico)
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function actualizar(actor, id, cambios) {
  obtener(id);
  if (actor.id === id) {
    throw new ConflictError('No puedes cambiar tu propio rol o estado', 'ACCION_SOBRE_SI_MISMO');
  }
  const actualizado = usuariosRepository.actualizar(id, cambios);
  if (cambios.activo === false) sesionesRepository.eliminarDeUsuario(id);
  return usuarioPublico(actualizado);
}
