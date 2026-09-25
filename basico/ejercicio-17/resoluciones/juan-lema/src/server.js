import app from "./app.js";

const PORT = process.env.PORT || 3017;

app.listen(PORT, () => {
  console.log(`API de viajes escuchando en http://localhost:${PORT}`);
});
