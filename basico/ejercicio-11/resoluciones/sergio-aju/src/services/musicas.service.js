export function buscarMusicas() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          nombre: 'Blinding Lights',
          artista: 'The Weeknd'
        },
        {
          id: 2,
          nombre: 'Shape of You',
          artista: 'Ed Sheeran'
        }
      ]);
    }, 1000);
  });
}