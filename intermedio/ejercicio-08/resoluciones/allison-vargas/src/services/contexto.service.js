import { obtenerRequestId } from '../utils/context.js';
import { construirHeaders } from './telemetria.service.js';

export const leerContexto = () => ({
  requestIdEnService: obtenerRequestId(),
  headersParaServiciosExternos: construirHeaders(),
});
