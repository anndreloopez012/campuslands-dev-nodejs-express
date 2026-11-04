export const busquedaArtistas = {
  limiteDefault: 10,
  limiteMax: 50,
  maxTerminos: 8,
  campos: {
    nombre: { peso: 4, resaltar: true },
    generos: { peso: 2 },
    albumes: { peso: 1, resaltar: true },
  },
  ordenes: {
    nombre: { campo: 'nombre', tipo: 'texto', sentido: 1 },
    canciones: { campo: 'canciones', tipo: 'numero', sentido: -1 },
    primerAnio: { campo: 'primerAnio', tipo: 'numero', sentido: 1 },
  },
  ordenSinBusqueda: 'nombre',
  desempate: 'nombre',
};
