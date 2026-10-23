import app from "./app.js";

const PORT = process.env.PORT || 3025;

app.listen(PORT, () => {
  console.log(`API de misiones RPG escuchando en http://localhost:${PORT}`);
});
