import { pedidosRepository } from '../repositories/pedidos.repository.js';
import { productosRepository } from '../repositories/productos.repository.js';
import { ConflictError, NotFoundError, PermisoError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS, TRANSICIONES } from '../constants/pedidos.js';

const ordenes = {
  reciente: (a, b) => b.id - a.id,
  total: (a, b) => b.total - a.total || b.id - a.id,
};

const configListado = {
  filtros: { estado: filtroEnum(ESTADOS) },
  ordenes,
  ordenPorDefecto: 'reciente',
};

const esAdmin = (usuario) => usuario.rol === 'admin';

export function obtenerVisible(usuario, id) {
  const pedido = pedidosRepository.buscar(id);
  if (!pedido || (!esAdmin(usuario) && pedido.usuarioId !== usuario.id)) {
    throw new NotFoundError(`No existe el pedido ${id}`, 'PEDIDO_NO_ENCONTRADO');
  }
  return pedido;
}

export function listar(usuario, query) {
  const consulta = leerListado(query, configListado);
  const { estado } = consulta.filtros;

  const filtrados = pedidosRepository
    .listar((pedido) =>
      (esAdmin(usuario) || pedido.usuarioId === usuario.id)
      && (estado === undefined || pedido.estado === estado))
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function crear(usuario, { items, direccion }) {
  const lineas = items.map(({ productoId, talla, cantidad }, indice) => {
    const producto = productosRepository.buscar(productoId);
    if (!producto) throw new ReferenciaError(`items[${indice}].productoId`, `el producto ${productoId} no existe`);
    if (producto.stock < cantidad) {
      throw new ConflictError(`No hay stock suficiente de ${producto.nombre} (quedan ${producto.stock})`, 'SIN_STOCK');
    }
    return { productoId, nombre: producto.nombre, talla, precio: producto.precio, cantidad };
  });

  lineas.forEach((linea) => {
    const producto = productosRepository.buscar(linea.productoId);
    productosRepository.actualizar(producto.id, { stock: producto.stock - linea.cantidad });
  });

  return pedidosRepository.crear({
    usuarioId: usuario.id,
    items: lineas,
    total: lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0),
    direccion,
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
  });
}

export function cambiarEstado(usuario, id, { estado }) {
  const pedido = obtenerVisible(usuario, id);

  if (!esAdmin(usuario) && estado !== 'cancelado') {
    throw new PermisoError('Un cliente solo puede cancelar su pedido', 'ACCION_SOLO_ADMIN');
  }
  if (!TRANSICIONES[pedido.estado].includes(estado)) {
    throw new ConflictError(`No se puede pasar de ${pedido.estado} a ${estado}`, 'TRANSICION_INVALIDA');
  }
  if (!esAdmin(usuario) && pedido.estado !== 'pendiente') {
    throw new ConflictError('Un cliente solo puede cancelar pedidos pendientes', 'TRANSICION_INVALIDA');
  }

  if (estado === 'cancelado') {
    pedido.items.forEach((linea) => {
      const producto = productosRepository.buscar(linea.productoId);
      if (producto) productosRepository.actualizar(producto.id, { stock: producto.stock + linea.cantidad });
    });
  }
  return pedidosRepository.actualizar(id, { estado });
}
