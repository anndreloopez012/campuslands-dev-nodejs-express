import app from "./app.js";

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
  console.log(`API de battle royale escuchando en http://localhost:${PORT}`);
});
