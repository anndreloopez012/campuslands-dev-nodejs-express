import { librosRepository } from '../repositories/libros.repository.js';
import { favoritosRepository } from '../repositories/favoritos.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { GENEROS } from '../validators/schemas.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  titulo: (a, b) => collator.compare(a.titulo, b.titulo) || a.id - b.id,
  autor: (a, b) => collator.compare(a.autor, b.autor) || collator.compare(a.titulo, b.titulo),
  anio: (a, b) => b.anio - a.anio || a.id - b.id,
};

const configListado = {
  filtros: { genero: filtroEnum(GENEROS), anioMin: filtroEntero(1000, 2100), disponible: filtroBooleano },
  ordenes,
  ordenPorDefecto: 'titulo',
};

export function obtener(id) {
  const libro = librosRepository.buscar(id);
  if (!libro) throw new NotFoundError(`No existe el libro ${id}`, 'LIBRO_NO_ENCONTRADO');
  return libro;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { genero, anioMin, disponible } = consulta.filtros;

  const filtrados = librosRepository
    .listar((libro) =>
      (genero === undefined || libro.genero === genero)
      && (anioMin === undefined || libro.anio >= anioMin)
      && (disponible === undefined || libro.disponible === disponible))
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

function verificarDuplicado(titulo, autor, idActual) {
  const clave = `${normalizar(titulo)}|${normalizar(autor)}`;
  const repetido = librosRepository.listar(
    (libro) => libro.id !== idActual && `${normalizar(libro.titulo)}|${normalizar(libro.autor)}` === clave,
  );
  if (repetido.length) throw new ConflictError('Ya existe un libro con ese titulo y autor', 'LIBRO_DUPLICADO');
}

export function crear(datos) {
  verificarDuplicado(datos.titulo, datos.autor);
  return librosRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  verificarDuplicado(cambios.titulo ?? actual.titulo, cambios.autor ?? actual.autor, id);
  return librosRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  obtener(id);
  favoritosRepository.eliminarDeLibro(id);
  librosRepository.eliminar(id);
}
