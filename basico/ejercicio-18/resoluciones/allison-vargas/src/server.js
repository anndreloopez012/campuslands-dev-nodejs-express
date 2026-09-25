import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' La zona de salto esta abierta...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
