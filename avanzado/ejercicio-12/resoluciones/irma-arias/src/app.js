const express = require('express');
const app = express();
app.get('/movies/export', (req, res) => {
  res.attachment('peliculas.json').json([{ title: 'La sombra', genre: 'terror' }]);
});
app.listen(process.env.PORT || 3000);
