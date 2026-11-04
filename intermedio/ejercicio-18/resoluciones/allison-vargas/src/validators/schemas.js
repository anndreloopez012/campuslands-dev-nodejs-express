export const LICENCIAS = ['A', 'B', 'C', 'D'];

export const esquemaRegistro = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'password', requerido: true },
  licencia: { tipo: 'enum', valores: LICENCIAS, porDefecto: 'A' },
};

export const esquemaLogin = {
  email: { tipo: 'email', requerido: true },
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaCambioPassword = {
  email: { tipo: 'email', requerido: true },
  passwordActual: { tipo: 'secreto', min: 1, max: 72, requerido: true },
  passwordNueva: { tipo: 'password', requerido: true },
};

export const esquemaDemo = {
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
};

export const esquemaVerificar = {
  password: { tipo: 'secreto', min: 1, max: 72, requerido: true },
  hash: { tipo: 'texto', min: 10, max: 300, requerido: true },
};
