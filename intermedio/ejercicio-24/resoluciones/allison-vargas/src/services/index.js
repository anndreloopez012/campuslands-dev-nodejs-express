import { ELEMENTOS } from '../constants/quimica.js';
import { compuestosRepository } from '../repositories/compuestos.repository.js';
import { crearFormulasService } from './formulas.service.js';
import { crearCompuestosService } from './compuestos.service.js';

export const formulas = crearFormulasService({ elementos: ELEMENTOS });

export const compuestos = crearCompuestosService({ repositorio: compuestosRepository, formulas });
