import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  PROYECTO_NO_ENCONTRADO: [404, (c) => `No existe el proyecto ${c.proyectoId}`],
  SUSCRIPCION_NO_ENCONTRADA: [404, (c) => `No existe la suscripcion ${c.suscripcionId}`],
  ENTREGA_NO_ENCONTRADA: [404, (c) => `No existe la entrega ${c.entregaId}`],
  PROYECTO_YA_APROBADO: [409, (c) => `El proyecto ${c.proyectoId} ya fue aprobado`],
  ENTREGA_NO_REINTENTABLE: [409, (c) => `La entrega ${c.entregaId} esta ${c.estado}; solo se reintentan las fallidas`],
};
