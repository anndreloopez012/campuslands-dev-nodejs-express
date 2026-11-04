import { reservasRepository } from '../repositories/reservas.repository.js';
import { toursRepository } from '../repositories/tours.repository.js';
import { ConflictError, NotFoundError, PermisoError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { ESTADOS_RESERVA, TRANSICIONES_RESERVA } from '../constants/estados.js';
import { tienePermiso } from '../constants/permisos.js';
import { cuposOcupados } from './tours.service.js';

const ordenes = {
  reciente: (a, b) => b.id - a.id,
  antigua: (a, b) => a.id - b.id,
};

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS_RESERVA),
    tourId: filtroEntero(1, 1000000000),
  },
  ordenes,
  ordenPorDefecto: 'reciente',
};

function puedeVer(usuario, reserva) {
  if (tienePermiso(usuario, 'reservas:ver-todas')) return true;
  if (reserva.usuarioId === usuario.id) return true;
  if (!tienePermiso(usuario, 'reservas:ver-de-mis-tours')) return false;
  const tour = toursRepository.buscar(reserva.tourId);
  return Boolean(tour) && tour.guiaId === usuario.id;
}

export function obtenerVisible(usuario, id) {
  const reserva = reservasRepository.buscar(id);
  if (!reserva || !puedeVer(usuario, reserva)) {
    throw new NotFoundError(`No existe la reserva ${id}`, 'RESERVA_NO_ENCONTRADA');
  }
  return reserva;
}

export function listar(usuario, query) {
  const consulta = leerListado(query, configListado);
  const { estado, tourId } = consulta.filtros;

  const filtradas = reservasRepository
    .listar((reserva) =>
      puedeVer(usuario, reserva)
      && (estado === undefined || reserva.estado === estado)
      && (tourId === undefined || reserva.tourId === tourId))
    .sort(consulta.comparador);

  return paginar(filtradas, consulta.pagina, consulta.limite);
}

export function crear(usuario, { tourId, personas }) {
  const tour = toursRepository.buscar(tourId);
  if (!tour || tour.estado === 'borrador') {
    throw new ReferenciaError('tourId', `el tour ${tourId} no existe o no esta publicado`);
  }
  if (tour.estado === 'cerrado') throw new ConflictError('El tour esta cerrado', 'TOUR_CERRADO');
  if (tour.guiaId === usuario.id) throw new ConflictError('No puedes reservar un tour que tu mismo guias', 'TOUR_PROPIO');

  const repetida = reservasRepository.listar(
    (reserva) => reserva.tourId === tourId && reserva.usuarioId === usuario.id && reserva.estado !== 'cancelada',
  );
  if (repetida.length) throw new ConflictError('Ya tienes una reserva activa para este tour', 'RESERVA_DUPLICADA');

  const disponibles = tour.cupos - cuposOcupados(tourId);
  if (personas > disponibles) {
    throw new ConflictError(`Solo quedan ${disponibles} cupos disponibles`, 'SIN_CUPOS');
  }

  return reservasRepository.crear({
    tourId,
    usuarioId: usuario.id,
    personas,
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
  });
}

function validarPermisoDeEstado(usuario, reserva, estado) {
  if (estado === 'confirmada') {
    if (tienePermiso(usuario, 'reservas:confirmar-todas')) return;
    const tour = toursRepository.buscar(reserva.tourId);
    if (tienePermiso(usuario, 'reservas:confirmar-de-mis-tours') && tour && tour.guiaId === usuario.id) return;
    throw new PermisoError('No puedes confirmar esta reserva', 'RESERVA_SIN_PERMISO');
  }
  if (tienePermiso(usuario, 'reservas:cancelar-todas')) return;
  if (tienePermiso(usuario, 'reservas:cancelar-propias') && reserva.usuarioId === usuario.id) return;
  throw new PermisoError('No puedes cancelar esta reserva', 'RESERVA_SIN_PERMISO');
}

export function cambiarEstado(usuario, id, { estado }) {
  const reserva = obtenerVisible(usuario, id);
  validarPermisoDeEstado(usuario, reserva, estado);

  if (!TRANSICIONES_RESERVA[reserva.estado].includes(estado)) {
    throw new ConflictError(`No se puede pasar de ${reserva.estado} a ${estado}`, 'TRANSICION_INVALIDA');
  }
  return reservasRepository.actualizar(id, { estado });
}
