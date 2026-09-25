import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' El estudio de animacion 3D esta renderizando...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
