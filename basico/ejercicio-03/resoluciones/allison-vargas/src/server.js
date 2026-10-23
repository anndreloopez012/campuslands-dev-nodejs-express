const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' El draft de la partida ha comenzado...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
