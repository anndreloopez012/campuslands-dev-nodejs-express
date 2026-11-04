import { pedidosRepository } from '../repositories/pedidos.repository.js';
import { platosRepository } from '../repositories/platos.repository.js';
import { ConflictError, NotFoundError, PermisoError, ReferenciaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS, TRANSICIONES } from '../constants/pedidos.js';
import { tieneRol } from '../constants/roles.js';

const ordenes = {
  reciente: (a, b) => b.id - a.id,
  total: (a, b) => b.total - a.total || b.id - a.id,
};

const configListado = {
  filtros: { estado: filtroEnum(ESTADOS) },
  ordenes,
  ordenPorDefecto: 'reciente',
};

const esPersonal = (usuario) => tieneRol(usuario.rol, 'vendedor');

export function obtener(id) {
  const pedido = pedidosRepository.buscar(id);
  if (!pedido) throw new NotFoundError(`No existe el pedido ${id}`, 'PEDIDO_NO_ENCONTRADO');
  return pedido;
}

export function obtenerVisible(usuario, id) {
  const pedido = obtener(id);
  if (!esPersonal(usuario) && pedido.usuarioId !== usuario.id) {
    throw new PermisoError('Este pedido pertenece a otro usuario', 'PEDIDO_AJENO');
  }
  return pedido;
}

export function listar(usuario, query) {
  const consulta = leerListado(query, configListado);
  const { estado } = consulta.filtros;

  const filtrados = pedidosRepository
    .listar((pedido) =>
      (esPersonal(usuario) || pedido.usuarioId === usuario.id)
      && (estado === undefined || pedido.estado === estado))
    .sort(consulta.comparador);

  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function crear(usuario, { items, nota }) {
  const lineas = items.map(({ platoId, cantidad }, indice) => {
    const plato = platosRepository.buscar(platoId);
    if (!plato) throw new ReferenciaError(`items[${indice}].platoId`, `el plato ${platoId} no existe`);
    if (!plato.disponible) throw new ConflictError(`El plato ${plato.nombre} no esta disponible`, 'PLATO_NO_DISPONIBLE');
    return { platoId, nombre: plato.nombre, precio: plato.precio, cantidad };
  });

  const datos = {
    usuarioId: usuario.id,
    items: lineas,
    total: lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0),
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
  };
  if (nota !== undefined) datos.nota = nota;
  return pedidosRepository.crear(datos);
}

export function cambiarEstado(usuario, id, { estado }) {
  const pedido = obtenerVisible(usuario, id);

  if (!esPersonal(usuario) && estado !== 'cancelado') {
    throw new PermisoError('Un cliente solo puede cancelar su pedido');
  }
  if (!TRANSICIONES[pedido.estado].includes(estado)) {
    throw new ConflictError(
      `No se puede pasar de ${pedido.estado} a ${estado}`,
      'TRANSICION_INVALIDA',
    );
  }
  return pedidosRepository.actualizar(id, { estado });
}
