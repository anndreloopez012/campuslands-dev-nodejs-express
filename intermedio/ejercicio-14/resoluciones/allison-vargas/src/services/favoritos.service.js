import { favoritosRepository } from '../repositories/favoritos.repository.js';
import { librosRepository } from '../repositories/libros.repository.js';
import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado } from '../validators/consulta.js';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

const ordenes = {
  reciente: (a, b) => b.id - a.id,
  titulo: (a, b) => collator.compare(a.libro.titulo, b.libro.titulo) || a.id - b.id,
};

const configListado = { ordenes, ordenPorDefecto: 'reciente' };

const armar = (favorito) => ({
  id: favorito.id,
  libroId: favorito.libroId,
  agregadoEn: favorito.agregadoEn,
  libro: librosRepository.buscar(favorito.libroId),
});

export function listar(usuarioId, query) {
  const consulta = leerListado(query, configListado);
  const items = favoritosRepository.listarDeUsuario(usuarioId).map(armar).sort(consulta.comparador);
  return paginar(items, consulta.pagina, consulta.limite);
}

export function obtener(usuarioId, libroId) {
  const favorito = favoritosRepository.buscarDeUsuario(usuarioId, libroId);
  if (!favorito) throw new NotFoundError(`El libro ${libroId} no esta en tus favoritos`, 'FAVORITO_NO_ENCONTRADO');
  return favorito;
}

export function detalle(usuarioId, libroId) {
  return armar(obtener(usuarioId, libroId));
}

export function agregar(usuarioId, libroId) {
  if (!librosRepository.buscar(libroId)) throw new ReferenciaError('libroId', `el libro ${libroId} no existe`);
  if (favoritosRepository.buscarDeUsuario(usuarioId, libroId)) {
    throw new ConflictError('El libro ya esta en tus favoritos', 'FAVORITO_DUPLICADO');
  }
  const favorito = favoritosRepository.crear({ usuarioId, libroId, agregadoEn: new Date().toISOString() });
  return armar(favorito);
}

export function quitar(usuarioId, libroId) {
  const favorito = obtener(usuarioId, libroId);
  favoritosRepository.eliminar(favorito.id);
}
