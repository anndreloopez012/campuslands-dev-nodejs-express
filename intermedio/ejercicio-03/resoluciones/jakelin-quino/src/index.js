const express = require('express');

const app = express();
const ranking = (_req, res) => {
  res.json([{ team: 'Dragons', points: 12 }, { team: 'Wolves', points: 9 }]);
};

app.get('/ranking', ranking);
app.listen(3000, () => console.log('API MOBA en http://localhost:3000'));
