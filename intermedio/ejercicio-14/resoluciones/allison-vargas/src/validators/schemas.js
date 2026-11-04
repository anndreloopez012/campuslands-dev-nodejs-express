import { ROLES } from '../constants/roles.js';

export const GENEROS = ['novela', 'ciencia-ficcion', 'fantasia', 'misterio', 'historia', 'poesia'];

export const esquemaRegistro = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'password', requerido: true },
};

export const esquemaLogin = {
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaCambioPassword = {
  passwordActual: { tipo: 'secreto', min: 1, max: 72, requerido: true },
  passwordNueva: { tipo: 'password', requerido: true },
};

export const esquemaLibro = {
  titulo: { tipo: 'texto', min: 2, max: 120, requerido: true },
  autor: { tipo: 'texto', min: 2, max: 80, requerido: true },
  genero: { tipo: 'enum', valores: GENEROS, requerido: true },
  anio: { tipo: 'entero', min: 1000, max: 2100, requerido: true },
  paginas: { tipo: 'entero', min: 1, max: 5000, requerido: true },
  disponible: { tipo: 'booleano', porDefecto: true },
};

export const esquemaFavorito = {
  libroId: { tipo: 'entero', min: 1, max: 1000000000, requerido: true },
};

export const esquemaUsuarioAdmin = {
  rol: { tipo: 'enum', valores: ROLES },
  activo: { tipo: 'booleano' },
};
