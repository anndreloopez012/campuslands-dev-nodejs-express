const peliculas = [
  {
    id: 1,
    titulo: 'Interestelar'
  },
  {
    id: 2,
    titulo: 'Matrix'
  }
];

export function buscarPelicula(id) {
  const pelicula = peliculas.find(p => p.id === Number(id));

  if (!pelicula) {
    throw new Error('Película no encontrada');
  }

  return pelicula;
}