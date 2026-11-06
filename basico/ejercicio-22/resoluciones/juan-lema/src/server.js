import app from "./app.js";

const PORT = process.env.PORT || 3022;

app.listen(PORT, () => {
  console.log(`API de arquitectura 3D escuchando en http://localhost:${PORT}`);
});
