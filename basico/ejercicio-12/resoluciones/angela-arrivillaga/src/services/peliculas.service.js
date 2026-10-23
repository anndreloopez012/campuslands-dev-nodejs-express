const peliculas = [
  { id: 1, titulo: 'El Exorcista', anio: 1973, calificacion: 8.1 },
  { id: 2, titulo: 'Hereditary', anio: 2018, calificacion: 7.3 },
  { id: 3, titulo: 'Scream', anio: 1996, calificacion: 7.4 },
  { id: 4, titulo: 'It', anio: 2017, calificacion: 7.3 }
];

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function obtenerPeliculas() {
  await esperar(300);
  return peliculas;
}

export async function buscarPelicula(id) {
  await esperar(200);

  const pelicula = peliculas.find((p) => p.id === id);

  if (!pelicula) {
    throw new Error('Pelicula no encontrada');
  }

  return pelicula;
}

export async function obtenerResumen() {
  const lista = await obtenerPeliculas();
  const primera = await buscarPelicula(1);
  let suma = 0;

  for (let i = 0; i < lista.length; i++) {
    suma = suma + lista[i].calificacion;
  }

  return {
    total: lista.length,
    promedio: Number((suma / lista.length).toFixed(2)),
    primera: primera
  };
}
