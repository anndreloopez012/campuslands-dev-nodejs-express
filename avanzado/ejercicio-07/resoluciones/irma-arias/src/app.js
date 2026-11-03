const express = require('express');
const app = express();
let cache;
app.get('/cars', (req, res) => {
  if (!cache || Date.now() > cache.expires) cache = { cars: ['Aquila', 'Vector'], expires: Date.now() + 10000 };
  res.json(cache.cars);
});
app.listen(process.env.PORT || 3000);
