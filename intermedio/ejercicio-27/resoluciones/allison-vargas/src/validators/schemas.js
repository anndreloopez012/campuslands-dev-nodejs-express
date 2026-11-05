import { REGIONES } from '../constants/moba.js';

export const esquemaEquipo = {
  nombre: { tipo: 'texto', min: 3, max: 30, requerido: true, descripcion: 'Nombre del equipo. Unico sin distinguir mayusculas.' },
  tag: {
    tipo: 'texto',
    min: 2,
    max: 5,
    requerido: true,
    patron: /^[A-Z0-9]+$/,
    mensajePatron: 'solo admite mayusculas y numeros',
    descripcion: 'Sigla del equipo. Unica y no se puede cambiar despues.',
  },
  region: { tipo: 'enum', valores: REGIONES, requerido: true, descripcion: 'Region donde compite.' },
};

export const esquemaEquipoCambios = {
  nombre: esquemaEquipo.nombre,
  region: esquemaEquipo.region,
};

export const esquemaInscripcion = {
  equipoId: { tipo: 'entero', min: 1, max: 1000000, requerido: true, descripcion: 'Id del equipo que se inscribe.' },
};
