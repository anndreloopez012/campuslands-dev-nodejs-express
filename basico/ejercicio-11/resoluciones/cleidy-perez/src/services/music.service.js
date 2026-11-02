function loadTrack() { return new Promise((resolve) => setTimeout(() => resolve({ id: 1, title: 'Pulso nocturno', artist: 'Camila' }), 30)); }
function getNextSong(track) { return Promise.resolve({ ...track, next: 'Luz de enero', genre: 'indie' }); }
module.exports = { loadTrack, getNextSong };
