// se resume que scripts y arsenal tiene disponible.

import { armas } from '../data/armas.data.js';

export function obtenerResumenLoadout() {
  return {
    total_armas_disponibles: armas.length,
    scripts_disponibles: ['dev', 'start'],
  };
}

export function listarArmas() {
  return armas;
}
