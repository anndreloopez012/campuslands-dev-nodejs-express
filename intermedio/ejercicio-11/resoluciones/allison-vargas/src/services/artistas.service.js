import { buscar } from './busqueda.service.js';
import { listarTodas } from './canciones.service.js';
import { busquedaArtistas } from '../validators/busqueda/artistas.busqueda.js';

function agruparArtistas() {
  const mapa = new Map();
  for (const cancion of listarTodas()) {
    if (!mapa.has(cancion.artista)) {
      mapa.set(cancion.artista, { nombre: cancion.artista, generos: new Set(), albumes: new Set(), canciones: 0, primerAnio: cancion.anio });
    }
    const artista = mapa.get(cancion.artista);
    artista.generos.add(cancion.genero);
    artista.albumes.add(cancion.album);
    artista.canciones += 1;
    artista.primerAnio = Math.min(artista.primerAnio, cancion.anio);
  }
  return [...mapa.values()].map((artista, indice) => ({
    id: indice + 1,
    nombre: artista.nombre,
    generos: [...artista.generos].sort(),
    albumes: [...artista.albumes].sort(),
    canciones: artista.canciones,
    primerAnio: artista.primerAnio,
  }));
}

const artistas = agruparArtistas();

export const listar = (query) => buscar(artistas, query, busquedaArtistas);
