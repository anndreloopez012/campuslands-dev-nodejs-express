import { resenasRepository } from '../repositories/resenas.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { normalizar } from '../utils/texto.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero } from '../validators/consulta.js';

const ordenes = {
  recientes: (a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id,
  puntuacion: (a, b) => b.puntuacion - a.puntuacion || b.id - a.id,
  utiles: (a, b) => b.util - a.util || b.id - a.id,
};

const configListado = {
  filtros: { puntuacionMin: filtroEntero(1, 5) },
  ordenes,
  ordenPorDefecto: 'recientes',
};

function verificarAutor(peliculaId, autor, idActual) {
  const repetida = resenasRepository
    .porPelicula(peliculaId)
    .some((resena) => resena.id !== idActual && normalizar(resena.autor) === normalizar(autor));
  if (repetida) {
    throw new ConflictError(`${autor} ya escribio una resena para esta pelicula`, 'RESENA_DUPLICADA');
  }
}

export function obtener(peliculaId, id) {
  const resena = resenasRepository.buscar(id);
  if (!resena || resena.peliculaId !== peliculaId) {
    throw new NotFoundError(`La pelicula ${peliculaId} no tiene la resena ${id}`, 'RESENA_NO_ENCONTRADA');
  }
  return resena;
}

export function listar(peliculaId, query) {
  const { filtros, comparador, pagina, limite } = leerListado(query, configListado);
  const resenas = resenasRepository
    .porPelicula(peliculaId)
    .filter((resena) => !filtros.puntuacionMin || resena.puntuacion >= filtros.puntuacionMin)
    .sort(comparador);
  return paginar(resenas, pagina, limite);
}

export function crear(peliculaId, datos) {
  verificarAutor(peliculaId, datos.autor);
  return resenasRepository.crear({ peliculaId, ...datos, util: 0, fecha: new Date().toISOString() });
}

export function actualizar(peliculaId, id, cambios) {
  obtener(peliculaId, id);
  if (cambios.autor) verificarAutor(peliculaId, cambios.autor, id);
  return resenasRepository.actualizar(id, cambios);
}

export function marcarUtil(peliculaId, id) {
  const resena = obtener(peliculaId, id);
  return resenasRepository.actualizar(id, { util: resena.util + 1 });
}

export function eliminar(peliculaId, id) {
  obtener(peliculaId, id);
  resenasRepository.eliminar(id);
}
