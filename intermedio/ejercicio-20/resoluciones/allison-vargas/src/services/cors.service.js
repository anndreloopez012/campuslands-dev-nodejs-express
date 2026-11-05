import { politicas } from '../config/cors.js';

export const describir = () => ({
  publica: { ...politicas.publica, rutas: ['/galeria', '/cors/politicas'] },
  restringida: { ...politicas.restringida, rutas: ['/obras'] },
});
