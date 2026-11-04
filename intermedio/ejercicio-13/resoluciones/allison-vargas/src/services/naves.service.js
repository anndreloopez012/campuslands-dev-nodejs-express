import { navesRepository } from '../repositories/naves.repository.js';
import { tripulantesRepository } from '../repositories/tripulantes.repository.js';
import { misionesRepository } from '../repositories/misiones.repository.js';
import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { CLASES } from '../validators/schemas.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  nombre: (a, b) => collator.compare(a.nombre, b.nombre) || a.id - b.id,
  anio: (a, b) => b.anioLanzamiento - a.anioLanzamiento || a.id - b.id,
  capacidad: (a, b) => b.capacidad - a.capacidad || a.id - b.id,
};

const INCLUIBLES = ['tripulantes', 'misiones'];

const configListado = {
  filtros: { clase: filtroEnum(CLASES), capacidadMin: filtroEntero(1, 50) },
  ordenes,
  ordenPorDefecto: 'nombre',
  incluibles: INCLUIBLES,
};

export const incluiblesNave = INCLUIBLES;

export function obtener(id) {
  const nave = navesRepository.buscar(id);
  if (!nave) throw new NotFoundError(`No existe la nave ${id}`, 'NAVE_NO_ENCONTRADA');
  return nave;
}

export function exigir(id) {
  const nave = navesRepository.buscar(id);
  if (!nave) throw new ReferenciaError('naveId', `la nave ${id} no existe`);
  return nave;
}

export function exigirCupo(nave, excluirTripulanteId) {
  const ocupados = tripulantesRepository
    .porNave(nave.id)
    .filter((tripulante) => tripulante.id !== excluirTripulanteId).length;
  if (ocupados >= nave.capacidad) {
    throw new ConflictError(`La nave ${nave.nombre} no tiene cupo (${ocupados}/${nave.capacidad})`, 'NAVE_LLENA');
  }
}

export function expandir(nave, incluir = []) {
  const ocupados = tripulantesRepository.porNave(nave.id);
  const salida = {
    ...nave,
    ocupacion: { tripulantes: ocupados.length, capacidad: nave.capacidad, libres: nave.capacidad - ocupados.length },
  };
  if (incluir.includes('tripulantes')) {
    salida.tripulantes = ocupados.map(({ id, nombre, rango, especie }) => ({ id, nombre, rango, especie }));
  }
  if (incluir.includes('misiones')) {
    salida.misiones = misionesRepository.porNave(nave.id).map(({ id, nombre, estado }) => ({ id, nombre, estado }));
  }
  return salida;
}

function verificarNombre(nombre, idActual) {
  const repetida = navesRepository.listar(
    (nave) => nave.id !== idActual && normalizar(nave.nombre) === normalizar(nombre),
  );
  if (repetida.length) throw new ConflictError(`Ya existe una nave llamada "${nombre}"`, 'NAVE_DUPLICADA');
}

export function listar(query) {
  const { filtros, comparador, incluir, pagina, limite } = leerListado(query, configListado);
  const naves = navesRepository
    .listar((nave) =>
      (!filtros.clase || nave.clase === filtros.clase) &&
      (!filtros.capacidadMin || nave.capacidad >= filtros.capacidadMin))
    .sort(comparador)
    .map((nave) => expandir(nave, incluir));
  return paginar(naves, pagina, limite);
}

export function crear(datos) {
  verificarNombre(datos.nombre);
  return navesRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  if (cambios.nombre) verificarNombre(cambios.nombre, id);
  const ocupados = tripulantesRepository.porNave(id).length;
  if (cambios.capacidad !== undefined && cambios.capacidad < ocupados) {
    throw new ConflictError(
      `La nave tiene ${ocupados} tripulantes y no puede bajar su capacidad a ${cambios.capacidad}`,
      'CAPACIDAD_INSUFICIENTE',
    );
  }
  return navesRepository.actualizar(actual.id, cambios);
}

export function eliminar(id) {
  obtener(id);
  const tripulantes = tripulantesRepository.porNave(id).length;
  const misiones = misionesRepository.porNave(id).length;
  if (tripulantes || misiones) {
    throw new ConflictError(
      `No se puede eliminar la nave: tiene ${tripulantes} tripulantes y ${misiones} misiones asociadas`,
      'NAVE_CON_RELACIONES',
    );
  }
  navesRepository.eliminar(id);
}
