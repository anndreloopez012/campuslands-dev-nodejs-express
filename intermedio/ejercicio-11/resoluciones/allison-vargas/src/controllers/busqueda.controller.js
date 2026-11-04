import { busquedaCanciones } from '../validators/busqueda/canciones.busqueda.js';
import { busquedaArtistas } from '../validators/busqueda/artistas.busqueda.js';

const describir = (config) => ({
  campos: Object.fromEntries(Object.entries(config.campos).map(([campo, { peso }]) => [campo, { peso }])),
  ordenes: ['relevancia', ...Object.keys(config.ordenes)],
  maxTerminos: config.maxTerminos,
  limiteDefault: config.limiteDefault,
  limiteMax: config.limiteMax,
});

export const opciones = (req, res) =>
  res.status(200).json({
    ok: true,
    data: {
      sintaxis: {
        terminos: 'cada palabra debe aparecer (modo=todos) o alguna (modo=alguno)',
        frase: '"noche de papel" busca las palabras juntas y en ese orden',
        exclusion: '-lluvia descarta los resultados que contengan esa palabra',
      },
      modos: ['todos', 'alguno'],
      coincidencias: ['exacta', 'prefijo', 'contiene'],
      canciones: describir(busquedaCanciones),
      artistas: describir(busquedaArtistas),
    },
  });
