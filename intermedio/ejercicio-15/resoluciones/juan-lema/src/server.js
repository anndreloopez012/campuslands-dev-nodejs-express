import app from "./app.js";

const PORT = process.env.PORT || 4015;

app.listen(PORT, () => {
  console.log(`API de comida urbana escuchando en http://localhost:${PORT}`);
});
