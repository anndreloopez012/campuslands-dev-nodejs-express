import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' La partida esta por comenzar...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log('Scripts disponibles: npm run dev | npm run start');
});
