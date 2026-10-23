const { loadTrack, getNextSong } = require('./services/music.service');
function main() { console.log('=== Ejercicio 11: promesas basicas ==='); loadTrack().then((track) => { console.log('Canción cargada:', track); return getNextSong(track); }).then((song) => console.log('Siguiente canción:', song)).catch((error) => console.error('La promesa falló:', error.message)).finally(() => console.log('Ejercicio ejecutado correctamente.')); }
if (require.main === module) main();
module.exports = { main };
