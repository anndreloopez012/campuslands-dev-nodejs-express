import { Catalogo } from '../domain/catalogo.js';
import { loadJson } from '../utils/loadJson.js';
import { crearServicioExportaciones } from './exportaciones.service.js';
import { crearServicioPeliculas } from './peliculas.service.js';

export function crearServicios({
  reloj = () => new Date(),
  peliculas = loadJson('peliculas.json'),
  directores = loadJson('directores.json'),
  actores = loadJson('actores.json'),
  alSerializar,
} = {}) {
  const catalogo = new Catalogo({
    peliculas, directores, actores, reloj,
  });
  const servicioPeliculas = crearServicioPeliculas({ catalogo, reloj, alSerializar });
  return {
    catalogo,
    peliculas: servicioPeliculas,
    exportaciones: crearServicioExportaciones({ peliculas: servicioPeliculas, reloj }),
  };
}
