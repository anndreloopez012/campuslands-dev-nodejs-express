import express from 'express';

const app = express();
const songs = [
  { id: 1, title: 'Luna de papel', artist: 'Nora' },
  { id: 2, title: 'Ritmo del mar', artist: 'Los Viajeros' },
  { id: 3, title: 'Luna nueva', artist: 'Sol' }
];
app.get('/api/songs', (request, response) => {
  const query = String(request.query.q ?? '').trim().toLocaleLowerCase();
  const data = songs.filter((song) => `${song.title} ${song.artist}`.toLocaleLowerCase().includes(query));
  response.json({ query, total: data.length, data });
});
app.listen(process.env.PORT || 3000, () => console.log('API musical disponible en el puerto 3000'));
