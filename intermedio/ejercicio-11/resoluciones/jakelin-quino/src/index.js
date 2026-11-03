const express = require('express');

const app = express();
const songs = ['Midnight Road', 'Summer Lights', 'Night Drive'];
app.get('/songs', (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  res.json(songs.filter((song) => song.toLowerCase().includes(query)));
});

app.listen(3000, () => console.log('API música en http://localhost:3000'));
