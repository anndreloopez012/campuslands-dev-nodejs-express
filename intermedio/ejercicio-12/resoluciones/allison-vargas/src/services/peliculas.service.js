import { peliculasRepository } from '../repositories/peliculas.repository.js';
import { resenasRepository } from '../repositories/resenas.repository.js';
import { repartoRepository } from '../repositories/reparto.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { SUBGENEROS } from '../validators/schemas.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  titulo: (a, b) => collator.compare(a.titulo, b.titulo) || a.id - b.id,
  anio: (a, b) => b.anio - a.anio || a.id - b.id,
};

const configListado = {
  filtros: {
    subgenero: filtroEnum(SUBGENEROS),
    anioMin: filtroEntero(1900, 2100),
    anioMax: filtroEntero(1900, 2100),
  },
  ordenes,
  ordenPorDefecto: 'titulo',
};

function resumenDe(peliculaId) {
  const resenas = resenasRepository.porPelicula(peliculaId);
  const suma = resenas.reduce((total, resena) => total + resena.puntuacion, 0);
  return {
    resenas: resenas.length,
    promedio: resenas.length ? Number((suma / resenas.length).toFixed(2)) : null,
    reparto: repartoRepository.porPelicula(peliculaId).length,
  };
}

function verificarDuplicado(datos, idActual) {
  const repetida = peliculasRepository.listar(
    (pelicula) =>
      pelicula.id !== idActual &&
      normalizar(pelicula.titulo) === normalizar(datos.titulo) &&
      pelicula.anio === datos.anio,
  );
  if (repetida.length) {
    throw new ConflictError(`Ya existe la pelicula "${datos.titulo}" del ${datos.anio}`, 'PELICULA_DUPLICADA');
  }
}

export function obtener(id) {
  const pelicula = peliculasRepository.buscar(id);
  if (!pelicula) throw new NotFoundError(`No existe la pelicula ${id}`, 'PELICULA_NO_ENCONTRADA');
  return pelicula;
}

export const detalle = (id) => ({ ...obtener(id), resumen: resumenDe(id) });

export function listar(query) {
  const { filtros, comparador, pagina, limite } = leerListado(query, configListado);

  const filtradas = peliculasRepository
    .listar((pelicula) =>
      (!filtros.subgenero || pelicula.subgenero === filtros.subgenero) &&
      (!filtros.anioMin || pelicula.anio >= filtros.anioMin) &&
      (!filtros.anioMax || pelicula.anio <= filtros.anioMax))
    .sort(comparador)
    .map((pelicula) => ({ ...pelicula, resumen: resumenDe(pelicula.id) }));

  return paginar(filtradas, pagina, limite);
}

export function crear(datos) {
  verificarDuplicado(datos);
  return peliculasRepository.crear(datos);
}

export function actualizar(id, cambios) {
  const actual = obtener(id);
  verificarDuplicado({ ...actual, ...cambios }, id);
  return peliculasRepository.actualizar(id, cambios);
}

export function eliminar(id) {
  obtener(id);
  const resenas = resenasRepository.eliminarPorPelicula(id);
  const reparto = repartoRepository.eliminarPorPelicula(id);
  peliculasRepository.eliminar(id);
  return { resenas, reparto };
}
