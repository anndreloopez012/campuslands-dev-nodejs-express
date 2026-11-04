import { productosRepository } from '../repositories/productos.repository.js';
import { pedidosRepository } from '../repositories/pedidos.repository.js';
import { favoritosRepository } from '../repositories/favoritos.repository.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum, filtroBooleano } from '../validators/consulta.js';
import { CATEGORIAS } from '../validators/schemas.js';

const ordenes = {
  nombre: (a, b) => a.nombre.localeCompare(b.nombre) || a.id - b.id,
  precio: (a, b) => a.precio - b.precio || a.id - b.id,
  marca: (a, b) => a.marca.localeCompare(b.marca) || a.nombre.localeCompare(b.nombre),
};

const filtroMarca = (texto, error) => {
  if (texto.length < 1 || texto.length > 40) {
    error('debe tener entre 1 y 40 caracteres');
    return undefined;
  }
  return texto.toLowerCase();
};

const configListado = {
  filtros: {
    categoria: filtroEnum(CATEGORIAS),
    marca: filtroMarca,
    precioMax: filtroEntero(1, 5000),
    enStock: filtroBooleano,
  },
  ordenes,
  ordenPorDefecto: 'nombre',
};

const igual = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

function validarLibre(nombre, marca, idActual) {
  const repetido = productosRepository.listar(
    (producto) => producto.id !== idActual && igual(producto.nombre, nombre) && igual(producto.marca, marca),
  );
  if (repetido.length) throw new ConflictError('Ya existe un producto con ese nombre y marca', 'PRODUCTO_DUPLICADO');
}

export function obtener(id) {
  const producto = productosRepository.buscar(id);
  if (!producto) throw new NotFoundError(`No existe el producto ${id}`, 'PRODUCTO_NO_ENCONTRADO');
  return producto;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { categoria, marca, precioMax, enStock } = consulta.filtros;

  const filtrados = productosRepository
    .listar((producto) =>
      (categoria === undefined || producto.categoria === categoria)
      && (marca === undefined || producto.marca.toLowerCase() === marca)
      && (precioMax === undefined || producto.precio <= precioMax)
      && (enStock === undefined || (producto.stock > 0) === enStock))
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  validarLibre(datos.nombre, datos.marca);
  return productosRepository.crear(datos);
}

export function actualizar(actual, cambios) {
  validarLibre(cambios.nombre ?? actual.nombre, cambios.marca ?? actual.marca, actual.id);
  return productosRepository.actualizar(actual.id, cambios);
}

export function eliminar(id) {
  const enPedidos = pedidosRepository.listar(
    (pedido) => ['pendiente', 'pagado'].includes(pedido.estado) && pedido.items.some((item) => item.productoId === id),
  );
  if (enPedidos.length) throw new ConflictError('El producto esta en pedidos activos', 'PRODUCTO_EN_PEDIDOS');

  favoritosRepository.eliminarDonde((favorito) => favorito.productoId === id);
  productosRepository.eliminar(id);
}
