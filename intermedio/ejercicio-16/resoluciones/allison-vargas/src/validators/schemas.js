import { ESTADOS } from '../constants/pedidos.js';

export const CATEGORIAS = ['running', 'basket', 'casual', 'skate'];

export const esquemaRegistro = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'password', requerido: true },
};

export const esquemaLogin = {
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaProducto = {
  nombre: { tipo: 'texto', min: 2, max: 80, requerido: true },
  marca: { tipo: 'texto', min: 2, max: 40, requerido: true },
  categoria: { tipo: 'enum', valores: CATEGORIAS, requerido: true },
  precio: { tipo: 'entero', min: 1, max: 5000, requerido: true },
  stock: { tipo: 'entero', min: 0, max: 1000, requerido: true },
};

export const esquemaFavorito = {
  productoId: { tipo: 'entero', min: 1, max: 1000000000, requerido: true },
};

export const esquemaEstadoPedido = {
  estado: { tipo: 'enum', valores: ESTADOS, requerido: true },
};
