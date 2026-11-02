import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Motos & Mecánica API] Servidor ejecutándose en http://localhost:${PORT}`);
});