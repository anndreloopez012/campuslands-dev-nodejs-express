import { toursRepository } from '../repositories/tours.repository.js';
import { destinosRepository } from '../repositories/destinos.repository.js';
import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { reservasRepository } from '../repositories/reservas.repository.js';
import { ConflictError, NotFoundError, PermisoError, ReferenciaError, ValidationError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { ESTADOS_TOUR, TRANSICIONES_TOUR } from '../constants/estados.js';
import { tienePermiso } from '../constants/permisos.js';

const ordenes = {
  fecha: (a, b) => a.fechaInicio.localeCompare(b.fechaInicio) || a.id - b.id,
  precio: (a, b) => a.precio - b.precio || a.id - b.id,
  titulo: (a, b) => a.titulo.localeCompare(b.titulo) || a.id - b.id,
};

const configListado = {
  filtros: {
    destinoId: filtroEntero(1, 1000000000),
    guiaId: filtroEntero(1, 1000000000),
    estado: filtroEnum(ESTADOS_TOUR),
    precioMax: filtroEntero(1, 100000),
  },
  ordenes,
  ordenPorDefecto: 'fecha',
};

export function cuposOcupados(tourId) {
  return reservasRepository
    .listar((reserva) => reserva.tourId === tourId && reserva.estado !== 'cancelada')
    .reduce((suma, reserva) => suma + reserva.personas, 0);
}

export const vista = (tour) => ({ ...tour, cuposDisponibles: tour.cupos - cuposOcupados(tour.id) });

export function puedeVer(usuario, tour) {
  if (tour.estado === 'publicado') return true;
  if (!usuario) return false;
  return tienePermiso(usuario, 'tours:ver-borradores') || tour.guiaId === usuario.id;
}

export const puedeGestionar = (usuario, tour) =>
  tienePermiso(usuario, 'tours:gestionar-todos')
  || (tienePermiso(usuario, 'tours:gestionar-propios') && tour.guiaId === usuario.id);

export function obtener(id) {
  const tour = toursRepository.buscar(id);
  if (!tour) throw new NotFoundError(`No existe el tour ${id}`, 'TOUR_NO_ENCONTRADO');
  return tour;
}

export function obtenerVisible(usuario, id) {
  const tour = obtener(id);
  if (!puedeVer(usuario, tour)) throw new NotFoundError(`No existe el tour ${id}`, 'TOUR_NO_ENCONTRADO');
  return tour;
}

export function listar(usuario, query) {
  const consulta = leerListado(query, configListado);
  const { destinoId, guiaId, estado, precioMax } = consulta.filtros;

  const filtrados = toursRepository
    .listar((tour) =>
      puedeVer(usuario, tour)
      && (destinoId === undefined || tour.destinoId === destinoId)
      && (guiaId === undefined || tour.guiaId === guiaId)
      && (estado === undefined || tour.estado === estado)
      && (precioMax === undefined || tour.precio <= precioMax))
    .sort(consulta.comparador);

  const pagina = paginar(filtrados, consulta.pagina, consulta.limite);
  return { ...pagina, data: pagina.data.map(vista) };
}

function validarReferencias({ destinoId, guiaId }) {
  if (destinoId !== undefined && !destinosRepository.buscar(destinoId)) {
    throw new ReferenciaError('destinoId', `el destino ${destinoId} no existe`);
  }
  if (guiaId !== undefined) {
    const guia = usuariosRepository.buscar(guiaId);
    if (!guia || guia.rol !== 'guia') throw new ReferenciaError('guiaId', `el usuario ${guiaId} no es un guia`);
  }
}

export function crear(usuario, datos) {
  const gestionaTodos = tienePermiso(usuario, 'tours:gestionar-todos');
  const nuevo = { ...datos, estado: datos.estado ?? 'borrador' };

  if (nuevo.estado === 'cerrado') {
    throw new ValidationError('Datos invalidos', [{ campo: 'estado', mensaje: 'un tour nuevo solo puede ser borrador o publicado' }]);
  }

  if (gestionaTodos) {
    if (nuevo.guiaId === undefined) {
      throw new ValidationError('Datos invalidos', [{ campo: 'guiaId', mensaje: 'es obligatorio' }]);
    }
  } else if (nuevo.guiaId === undefined) {
    nuevo.guiaId = usuario.id;
  } else if (nuevo.guiaId !== usuario.id) {
    throw new PermisoError('Un guia solo puede crear tours a su nombre', 'TOUR_AJENO');
  }

  validarReferencias(nuevo);
  return vista(toursRepository.crear(nuevo));
}

export function actualizar(usuario, tour, cambios) {
  if (!puedeGestionar(usuario, tour)) throw new PermisoError('Este tour pertenece a otro guia', 'TOUR_AJENO');
  if (tour.estado === 'cerrado') throw new ConflictError('Un tour cerrado no se puede modificar', 'TOUR_CERRADO');

  if (
    cambios.guiaId !== undefined
    && cambios.guiaId !== tour.guiaId
    && !tienePermiso(usuario, 'tours:gestionar-todos')
  ) {
    throw new PermisoError('Solo un agente o admin puede reasignar el guia', 'TOUR_AJENO');
  }

  validarReferencias(cambios);

  if (cambios.estado !== undefined && cambios.estado !== tour.estado
    && !TRANSICIONES_TOUR[tour.estado].includes(cambios.estado)) {
    throw new ConflictError(`No se puede pasar de ${tour.estado} a ${cambios.estado}`, 'TRANSICION_INVALIDA');
  }

  if (cambios.cupos !== undefined && cambios.cupos < cuposOcupados(tour.id)) {
    throw new ConflictError('Los cupos no pueden ser menores a los ya reservados', 'CUPOS_INSUFICIENTES');
  }

  return vista(toursRepository.actualizar(tour.id, cambios));
}

export function eliminar(usuario, tour) {
  if (!tienePermiso(usuario, 'tours:eliminar')) {
    if (!puedeGestionar(usuario, tour)) throw new PermisoError('Este tour pertenece a otro guia', 'TOUR_AJENO');
    if (tour.estado !== 'borrador') {
      throw new PermisoError('Un guia solo puede eliminar sus tours en borrador', 'TOUR_NO_ELIMINABLE');
    }
  }

  const activas = reservasRepository.listar((reserva) => reserva.tourId === tour.id && reserva.estado !== 'cancelada');
  if (activas.length) throw new ConflictError('El tour tiene reservas activas', 'TOUR_CON_RESERVAS');

  reservasRepository.eliminarDonde((reserva) => reserva.tourId === tour.id);
  toursRepository.eliminar(tour.id);
}
