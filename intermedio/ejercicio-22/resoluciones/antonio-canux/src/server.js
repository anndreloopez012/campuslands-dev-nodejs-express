import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('[arquitectura 3D] Servidor activo en http://localhost:' + PORT);
});
