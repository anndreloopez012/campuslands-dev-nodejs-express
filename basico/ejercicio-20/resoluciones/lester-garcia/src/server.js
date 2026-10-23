import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Digital Art API] Servidor corriendo en http://localhost:${PORT}`);
});