import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Battle Royale API] Servidor ejecutándose en http://localhost:${PORT}`);
});