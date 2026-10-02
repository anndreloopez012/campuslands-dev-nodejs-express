const canciones = [
  { id: 1, titulo: 'Bohemian Rhapsody', artista: 'Queen', duracion: 354 },
  { id: 2, titulo: 'Billie Jean', artista: 'Michael Jackson', duracion: 294 },
  { id: 3, titulo: 'Somebody to Love', artista: 'Queen', duracion: 296 },
  { id: 4, titulo: 'Smells Like Teen Spirit', artista: 'Nirvana', duracion: 301 }
];

export function obtenerCanciones() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(canciones);
    }, 300);
  });
}

export function buscarCancion(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cancion = canciones.find((c) => c.id === id);

      if (cancion) {
        resolve(cancion);
      } else {
        reject(new Error('Cancion no encontrada'));
      }
    }, 200);
  });
}

export function obtenerArtistas() {
  return obtenerCanciones().then((lista) => {
    const artistas = [];

    for (let i = 0; i < lista.length; i++) {
      if (!artistas.includes(lista[i].artista)) {
        artistas.push(lista[i].artista);
      }
    }

    return artistas;
  });
}
