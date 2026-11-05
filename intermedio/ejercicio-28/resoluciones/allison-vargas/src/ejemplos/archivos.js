import { PASOS, SECCIONES } from './catalogo.js';
import { generarHttp } from './formatos/http.js';
import { generarPostman } from './formatos/postman.js';
import { generarPowershell } from './formatos/powershell.js';
import { generarBash } from './formatos/bash.js';
import { BASE_RUTAS } from '../constants/rutas.js';

export const URL_BASE = `http://localhost:3000${BASE_RUTAS}`;
export const TITULO = 'Battle royale API - coleccion de ejemplos HTTP';

export function generarArchivos(pasos = PASOS, secciones = SECCIONES) {
  const opciones = { baseUrl: URL_BASE, titulo: TITULO };
  return {
    'ejemplos/battle-royale.http': generarHttp(pasos, opciones),
    'ejemplos/battle-royale.postman_collection.json': generarPostman(pasos, secciones, opciones),
    'ejemplos/battle-royale.ps1': generarPowershell(pasos, opciones),
    'ejemplos/battle-royale.sh': generarBash(pasos, opciones),
  };
}
