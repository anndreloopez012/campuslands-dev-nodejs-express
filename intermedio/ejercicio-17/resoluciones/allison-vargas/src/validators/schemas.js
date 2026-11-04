import { ROLES } from '../constants/permisos.js';
import { ESTADOS_RESERVA, ESTADOS_TOUR } from '../constants/estados.js';

export const TIPOS_DESTINO = ['cultural', 'naturaleza', 'aventura', 'playa'];

export const esquemaRegistro = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'password', requerido: true },
};

export const esquemaLogin = {
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaDestino = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  pais: { tipo: 'texto', min: 2, max: 60, requerido: true },
  tipo: { tipo: 'enum', valores: TIPOS_DESTINO, requerido: true },
};

export const esquemaTour = {
  titulo: { tipo: 'texto', min: 3, max: 80, requerido: true },
  destinoId: { tipo: 'entero', min: 1, max: 1000000000, requerido: true },
  precio: { tipo: 'entero', min: 1, max: 100000, requerido: true },
  cupos: { tipo: 'entero', min: 1, max: 200, requerido: true },
  fechaInicio: { tipo: 'fecha', requerido: true },
  guiaId: { tipo: 'entero', min: 1, max: 1000000000 },
  estado: { tipo: 'enum', valores: ESTADOS_TOUR },
};

export const esquemaReserva = {
  tourId: { tipo: 'entero', min: 1, max: 1000000000, requerido: true },
  personas: { tipo: 'entero', min: 1, max: 10, porDefecto: 1 },
};

export const esquemaEstadoReserva = {
  estado: { tipo: 'enum', valores: ESTADOS_RESERVA.filter((estado) => estado !== 'pendiente'), requerido: true },
};

export const esquemaRol = {
  rol: { tipo: 'enum', valores: ROLES, requerido: true },
};
