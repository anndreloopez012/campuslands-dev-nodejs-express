const express = require('express');

const app = express();
app.use(express.json());
app.post('/songs/import', (req, res) => {
  const songs = req.body?.songs;
  if (!Array.isArray(songs) || songs.some((song) =>
    typeof song?.title !== 'string' || !song.title.trim() ||
    typeof song.artist !== 'string' || !song.artist.trim())) {
    return res.status(400).json({ error: 'Envía canciones con título y artista' });
  }
  res.status(201).json({ imported: songs.length, songs });
});
app.listen(3000, () => console.log('Música API en http://localhost:3000'));
