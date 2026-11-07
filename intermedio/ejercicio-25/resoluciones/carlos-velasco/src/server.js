const app = require('./app');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor RPG ejecutandose en http://localhost:${PORT}`);
});
