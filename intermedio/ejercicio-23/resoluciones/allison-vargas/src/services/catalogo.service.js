import { MATERIALES, PROCESOS } from '../constants/soldadura.js';

export const describir = () => ({
  procesos: Object.entries(PROCESOS).map(([clave, datos]) => ({ clave, ...datos })),
  materiales: Object.entries(MATERIALES).map(([clave, datos]) => ({ clave, ...datos })),
});
