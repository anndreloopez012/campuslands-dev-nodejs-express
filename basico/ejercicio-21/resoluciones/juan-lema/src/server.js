import app from "./app.js";

const PORT = process.env.PORT || 3021;

app.listen(PORT, () => {
  console.log(`API de animacion 3D escuchando en http://localhost:${PORT}`);
});
