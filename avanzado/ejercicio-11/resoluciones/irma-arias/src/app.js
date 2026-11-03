const express = require('express');
const app = express();
app.use(express.json());
app.post('/songs/import', (req, res) => {
  const songs = Array.isArray(req.body?.songs) ? req.body.songs.filter(song => typeof song === 'string' && song.trim()) : [];
  res.json({ imported: songs.map(title => ({ title: title.trim() })), count: songs.length });
});
app.listen(process.env.PORT || 3000);
