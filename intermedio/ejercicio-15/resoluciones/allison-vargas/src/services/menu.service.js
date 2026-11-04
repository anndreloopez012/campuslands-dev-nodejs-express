import { platosRepository } from '../repositories/platos.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { CATEGORIAS } from '../validators/schemas.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  nombre: (a, b) => collator.compare(a.nombre, b.nombre) || a.id - b.id,
  precio: (a, b) => a.precio - b.precio || collator.compare(a.nombre, b.nombre),
  categoria: (a, b) => collator.compare(a.categoria, b.categoria) || collator.compare(a.nombre, b.nombre),
};

const configListado = {
  filtros: {
    categoria: filtroEnum(CATEGORIAS),
    precioMax: filtroEntero(1, 1000),
    vegetariano: filtroBooleano,
    disponible: filtroBooleano,
  },
  ordenes,
  ordenPorDefecto: 'nombre',
};

export function obtener(id) {
  const plato = platosRepository.buscar(id);
  if (!plato) throw new NotFoundError(`No existe el plato ${id}`, 'PLATO_NO_ENCONTRADO');
  return plato;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { categoria, precioMax, vegetariano, disponible } = consulta.filtros;

  const filtrados = platosRepository
    .listar((plato) =>
      (categoria === undefined || plato.categoria === categoria)
      && (precioMax === undefined || plato.precio <= precioMax)
      && (vegetariano === undefined || plato.vegetariano === vegetariano)
      && (disponible === undefined || plato.disponible === disponible))
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

function verificarDuplicado(nombre, idActual) {
  const clave = normalizar(nombre);
  const repetido = platosRepository.listar((plato) => plato.id !== idActual && normalizar(plato.nombre) === clave);
  if (repetido.length) throw new ConflictError('Ya existe un plato con ese nombre', 'PLATO_DUPLICADO');
}

export function crear(datos) {
  verificarDuplicado(datos.nombre);
  return platosRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  if (cambios.nombre !== undefined) verificarDuplicado(cambios.nombre, actual.id);
  return platosRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  obtener(id);
  platosRepository.eliminar(id);
}
