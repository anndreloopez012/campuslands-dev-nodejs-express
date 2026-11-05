import { crearRegistro } from '../metricas/registro.js';
import { crearMetricasHttp } from '../metricas/http.js';
import { loadJson } from '../utils/loadJson.js';
import { crearServicioBiblioteca } from './biblioteca.service.js';
import { crearServicioMetricas } from './metricas.service.js';

export function crearServicios({ reloj = () => new Date(), libros = loadJson('libros.json'), maxSeries } = {}) {
  const registro = crearRegistro({ maxSeries });
  const http = crearMetricasHttp(registro);
  const biblioteca = crearServicioBiblioteca({ libros, reloj, registro });
  return {
    registro, http, biblioteca, metricas: crearServicioMetricas({ registro, reloj }),
  };
}
