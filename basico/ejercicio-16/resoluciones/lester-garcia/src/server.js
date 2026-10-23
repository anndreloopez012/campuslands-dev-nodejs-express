import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Apparel Express Server] Servidor iniciado en http://localhost:${PORT}`);
});