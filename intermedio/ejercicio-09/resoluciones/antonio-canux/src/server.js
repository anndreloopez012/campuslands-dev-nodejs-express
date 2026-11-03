import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('[kickboxing] Servidor activo en http://localhost:' + PORT);
});
