import { NOMBRES_CLASES, TIPOS_ITEM, RAREZAS } from '../constants/rpg.js';

export const esquemaPersonaje = {
  nombre: { tipo: 'texto', min: 3, max: 20, requerido: true },
  clase: { tipo: 'enum', valores: NOMBRES_CLASES, requerido: true },
};

export const esquemaRenombrar = {
  nombre: { tipo: 'texto', min: 3, max: 20, requerido: true },
};

export const esquemaItem = {
  nombre: { tipo: 'texto', min: 2, max: 40, requerido: true },
  tipo: { tipo: 'enum', valores: TIPOS_ITEM, requerido: true },
  rareza: { tipo: 'enum', valores: RAREZAS, requerido: false, porDefecto: 'comun' },
  valor: { tipo: 'entero', min: 0, max: 100000, requerido: false, porDefecto: 0 },
  cantidad: { tipo: 'entero', min: 1, max: 99, requerido: false, porDefecto: 1 },
};
