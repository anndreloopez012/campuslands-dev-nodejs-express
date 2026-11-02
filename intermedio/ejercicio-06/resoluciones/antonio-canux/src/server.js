import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Taller Motos API] Servidor activo en http://localhost:${PORT}`);
});