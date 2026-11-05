import { ESTADOS_DESTINO, HORAS_MAX_ORDEN } from '../constants/taller.js';

export const esquemaLogin = {
  usuario: { tipo: 'texto', min: 3, max: 30, requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaCliente = {
  nombre: { tipo: 'texto', min: 3, max: 60, requerido: true },
  telefono: {
    tipo: 'texto',
    min: 8,
    max: 8,
    requerido: true,
    patron: /^[0-9]{8}$/,
    mensajePatron: 'debe tener 8 digitos',
  },
  email: { tipo: 'email', requerido: false },
};

export const esquemaMoto = {
  clienteId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  placa: {
    tipo: 'texto',
    min: 5,
    max: 7,
    requerido: true,
    patron: /^[A-Za-z0-9]+$/,
    mensajePatron: 'solo admite letras y numeros',
  },
  marca: { tipo: 'texto', min: 2, max: 30, requerido: true },
  modelo: { tipo: 'texto', min: 1, max: 40, requerido: true },
  cilindraje: { tipo: 'entero', min: 50, max: 2000, requerido: true },
  anio: { tipo: 'entero', min: 1980, max: 2030, requerido: true },
};

export const esquemaMotoEdicion = {
  clienteId: esquemaMoto.clienteId,
  marca: esquemaMoto.marca,
  modelo: esquemaMoto.modelo,
  cilindraje: esquemaMoto.cilindraje,
  anio: esquemaMoto.anio,
};

export const esquemaRepuesto = {
  codigo: {
    tipo: 'texto',
    min: 3,
    max: 12,
    requerido: true,
    patron: /^[A-Za-z0-9-]+$/,
    mensajePatron: 'solo admite letras, numeros y guion',
  },
  nombre: { tipo: 'texto', min: 3, max: 60, requerido: true },
  precio: { tipo: 'numero', min: 0.01, max: 100000, requerido: true },
  stock: { tipo: 'entero', min: 0, max: 100000, requerido: true },
};

export const esquemaRepuestoEdicion = {
  nombre: esquemaRepuesto.nombre,
  precio: esquemaRepuesto.precio,
};

export const esquemaReabastecer = {
  cantidad: { tipo: 'entero', min: 1, max: 10000, requerido: true },
};

export const esquemaOrden = {
  motoId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  descripcion: { tipo: 'texto', min: 5, max: 300, requerido: true },
};

export const esquemaAsignar = {
  mecanicoId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
};

export const esquemaEstado = {
  estado: { tipo: 'enum', valores: ESTADOS_DESTINO, requerido: true },
};

export const esquemaItem = {
  repuestoId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  cantidad: { tipo: 'entero', min: 1, max: 100, requerido: true },
};

export const esquemaHoras = {
  horas: { tipo: 'numero', min: 0.25, max: HORAS_MAX_ORDEN, requerido: true },
};
