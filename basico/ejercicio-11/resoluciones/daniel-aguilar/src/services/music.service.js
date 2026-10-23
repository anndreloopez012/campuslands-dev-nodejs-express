// Todo este archivo usa promesas "a mano" (new Promise, .then, .catch, .finally), sin async/await.
const artists = [
  { id: 1, name: 'Luna Roja', genre: 'rock' },
  { id: 2, name: 'DJ Pixel', genre: 'electronica' },
  { id: 3, name: 'Marimba Viva', genre: 'folclor' },
];

const albums = [
  { id: 1, title: 'Noches de Neon', artistId: 2, year: 2022 },
  { id: 2, title: 'Fuego Lento', artistId: 1, year: 2019 },
  { id: 3, title: 'Raices', artistId: 3, year: 2021 },
];

const stats = { lookups: 0 };

function notFound(entity, id) {
  const error = new Error(`${entity} con id ${id} no existe`);
  error.status = 404;
  return error;
}

// Crear una promesa: resolve (exito) / reject (fallo)
function findInList(list, entity, id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = list.find((element) => element.id === id);
      return item ? resolve({ ...item }) : reject(notFound(entity, id));
    }, 20);
  }).finally(() => {
    stats.lookups += 1; // .finally corre siempre, haya exito o error
  });
}

const findAlbum = (id) => findInList(albums, 'Album', id);
const findArtist = (id) => findInList(artists, 'Artista', id);

// Encadenar promesas: el valor de un .then es la entrada del siguiente
function getAlbumDetail(id) {
  return findAlbum(id)
    .then((album) => findArtist(album.artistId).then((artist) => ({ ...album, artist })));
}

// Promise.all: espera a todas en paralelo; si UNA falla, falla todo
function getCatalogSummary() {
  return Promise.all([
    new Promise((resolve) => setTimeout(() => resolve(albums.length), 20)),
    new Promise((resolve) => setTimeout(() => resolve(artists.length), 20)),
  ]).then(([totalAlbums, totalArtists]) => ({ totalAlbums, totalArtists }));
}

// Promise.allSettled: espera a todas y reporta exito/fallo de cada una por separado
function getAlbumsBatch(ids) {
  return Promise.allSettled(ids.map((id) => findAlbum(id))).then((results) =>
    results.map((result, index) =>
      result.status === 'fulfilled'
        ? { id: ids[index], status: 'ok', album: result.value }
        : { id: ids[index], status: 'error', message: result.reason.message }
    )
  );
}

const getStats = () => ({ ...stats });

module.exports = { getAlbumDetail, getCatalogSummary, getAlbumsBatch, getStats };
