import { favoritosRepository } from '../repositories/favoritos.repository.js';
import { productosRepository } from '../repositories/productos.repository.js';
import { ConflictError, NotFoundError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado } from '../validators/consulta.js';

const ordenes = {
  reciente: (a, b) => b.id - a.id,
  antiguo: (a, b) => a.id - b.id,
};

const configListado = { ordenes, ordenPorDefecto: 'reciente' };

export function listar(usuario, query) {
  const consulta = leerListado(query, configListado);
  const propios = favoritosRepository
    .listar((favorito) => favorito.usuarioId === usuario.id)
    .sort(consulta.comparador)
    .map((favorito) => ({ ...favorito, producto: productosRepository.buscar(favorito.productoId) }));
  return paginar(propios, consulta.pagina, consulta.limite);
}

export function agregar(usuario, { productoId }) {
  if (!productosRepository.buscar(productoId)) {
    throw new ReferenciaError('productoId', `el producto ${productoId} no existe`);
  }
  const existe = favoritosRepository.listar(
    (favorito) => favorito.usuarioId === usuario.id && favorito.productoId === productoId,
  );
  if (existe.length) throw new ConflictError('El producto ya esta en tus favoritos', 'FAVORITO_DUPLICADO');

  return favoritosRepository.crear({
    usuarioId: usuario.id,
    productoId,
    creadoEn: new Date().toISOString(),
  });
}

export function quitar(usuario, productoId) {
  const borrados = favoritosRepository.eliminarDonde(
    (favorito) => favorito.usuarioId === usuario.id && favorito.productoId === productoId,
  );
  if (!borrados) throw new NotFoundError('Ese producto no esta en tus favoritos', 'FAVORITO_NO_ENCONTRADO');
}
