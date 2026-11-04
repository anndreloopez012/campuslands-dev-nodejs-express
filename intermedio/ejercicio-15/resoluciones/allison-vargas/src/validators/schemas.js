import { ESTADOS } from '../constants/pedidos.js';

export const CATEGORIAS = ['tacos', 'hamburguesas', 'bowls', 'snacks', 'bebidas', 'postres'];

export const esquemaRegistro = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'password', requerido: true },
};

export const esquemaLogin = {
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaPlato = {
  nombre: { tipo: 'texto', min: 2, max: 80, requerido: true },
  categoria: { tipo: 'enum', valores: CATEGORIAS, requerido: true },
  precio: { tipo: 'entero', min: 1, max: 1000, requerido: true },
  vegetariano: { tipo: 'booleano', porDefecto: false },
  disponible: { tipo: 'booleano', porDefecto: true },
};

export const esquemaEstadoPedido = {
  estado: { tipo: 'enum', valores: ESTADOS, requerido: true },
};
