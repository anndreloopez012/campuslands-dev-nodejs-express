import { esquemaHeroe, esquemaHeroeEdicion } from './heroe.schema.js';
import { esquemaEquipo } from './equipo.schema.js';
import { esquemaDraft } from './draft.schema.js';

export const ESQUEMAS = Object.freeze({
  heroe: esquemaHeroe,
  'heroe-edicion': esquemaHeroeEdicion,
  equipo: esquemaEquipo,
  draft: esquemaDraft,
});
