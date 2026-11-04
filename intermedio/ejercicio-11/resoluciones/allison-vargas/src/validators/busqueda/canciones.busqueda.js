export const busquedaCanciones = {
  limiteDefault: 10,
  limiteMax: 50,
  maxTerminos: 8,
  campos: {
    titulo: { peso: 5, resaltar: true },
    artista: { peso: 4, resaltar: true },
    album: { peso: 3, resaltar: true },
    genero: { peso: 2 },
    descripcion: { peso: 1, resaltar: true, fragmento: true },
  },
  ordenes: {
    titulo: { campo: 'titulo', tipo: 'texto', sentido: 1 },
    artista: { campo: 'artista', tipo: 'texto', sentido: 1 },
    anio: { campo: 'anio', tipo: 'numero', sentido: -1 },
  },
  ordenSinBusqueda: 'titulo',
  desempate: 'titulo',
};
