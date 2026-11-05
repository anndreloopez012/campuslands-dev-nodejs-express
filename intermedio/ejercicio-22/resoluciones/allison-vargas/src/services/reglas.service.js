import { EXTENSIONES, EXTENSIONES_BLOQUEADAS, LIMITES_POR_CATEGORIA } from '../constants/archivos.js';
import { ttlSubidaSeg } from '../config/subidas.js';

export const describir = () => ({
  vigenciaSolicitudSeg: ttlSubidaSeg,
  limitesBytesPorCategoria: LIMITES_POR_CATEGORIA,
  extensiones: Object.entries(EXTENSIONES).map(([extension, regla]) => ({ extension, categoria: regla.categoria, mimes: regla.mimes })),
  extensionesBloqueadasEnElNombre: EXTENSIONES_BLOQUEADAS,
});
