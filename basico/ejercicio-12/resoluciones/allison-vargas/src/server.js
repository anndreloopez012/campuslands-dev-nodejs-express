import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' La sala de peliculas de miedo abre...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
