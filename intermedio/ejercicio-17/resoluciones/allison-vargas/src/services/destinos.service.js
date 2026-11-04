import { destinosRepository } from '../repositories/destinos.repository.js';
import { toursRepository } from '../repositories/tours.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { TIPOS_DESTINO } from '../validators/schemas.js';

const ordenes = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre) || a.id - b.id,
  pais: (a, b) => a.pais.localeCompare(b.pais) || a.nombre.localeCompare(b.nombre),
};

const configListado = {
  filtros: { tipo: filtroEnum(TIPOS_DESTINO) },
  ordenes,
  ordenPorDefecto: 'nombre',
};

const mismoNombre = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

function validarNombreLibre(nombre, pais, idActual) {
  const repetido = destinosRepository.listar(
    (destino) => destino.id !== idActual && mismoNombre(destino.nombre, nombre) && mismoNombre(destino.pais, pais),
  );
  if (repetido.length) throw new ConflictError('Ya existe un destino con ese nombre en ese pais', 'DESTINO_DUPLICADO');
}

export function obtener(id) {
  const destino = destinosRepository.buscar(id);
  if (!destino) throw new NotFoundError(`No existe el destino ${id}`, 'DESTINO_NO_ENCONTRADO');
  return destino;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { tipo } = consulta.filtros;
  const filtrados = destinosRepository
    .listar((destino) => tipo === undefined || destino.tipo === tipo)
    .sort(consulta.comparador);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  validarNombreLibre(datos.nombre, datos.pais);
  return destinosRepository.crear(datos);
}

export function actualizar(actual, cambios) {
  validarNombreLibre(cambios.nombre ?? actual.nombre, cambios.pais ?? actual.pais, actual.id);
  return destinosRepository.actualizar(actual.id, cambios);
}

export function eliminar(id) {
  if (toursRepository.listar((tour) => tour.destinoId === id).length) {
    throw new ConflictError('El destino tiene tours asociados', 'DESTINO_CON_TOURS');
  }
  destinosRepository.eliminar(id);
}
