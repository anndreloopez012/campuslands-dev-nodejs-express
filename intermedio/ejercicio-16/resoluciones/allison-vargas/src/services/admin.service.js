import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { productosRepository } from '../repositories/productos.repository.js';
import { pedidosRepository } from '../repositories/pedidos.repository.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { ROLES } from '../constants/roles.js';
import { ESTADOS } from '../constants/pedidos.js';

const configUsuarios = {
  filtros: { rol: filtroEnum(ROLES) },
  ordenes: { id: (a, b) => a.id - b.id, nombre: (a, b) => a.nombre.localeCompare(b.nombre) || a.id - b.id },
  ordenPorDefecto: 'id',
};

export function resumen() {
  const usuarios = usuariosRepository.listar();
  const productos = productosRepository.listar();
  const pedidos = pedidosRepository.listar();

  return {
    usuarios: {
      total: usuarios.length,
      porRol: Object.fromEntries(ROLES.map((rol) => [rol, usuarios.filter((usuario) => usuario.rol === rol).length])),
    },
    productos: {
      total: productos.length,
      unidadesEnStock: productos.reduce((suma, producto) => suma + producto.stock, 0),
      agotados: productos.filter((producto) => producto.stock === 0).length,
    },
    pedidos: {
      total: pedidos.length,
      porEstado: Object.fromEntries(ESTADOS.map((estado) => [estado, pedidos.filter((pedido) => pedido.estado === estado).length])),
      ventas: pedidos
        .filter((pedido) => ['pagado', 'enviado'].includes(pedido.estado))
        .reduce((suma, pedido) => suma + pedido.total, 0),
    },
  };
}

export function listarUsuarios(query) {
  const consulta = leerListado(query, configUsuarios);
  const { rol } = consulta.filtros;
  const filtrados = usuariosRepository
    .listar((usuario) => rol === undefined || usuario.rol === rol)
    .sort(consulta.comparador)
    .map(usuarioPublico);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}
