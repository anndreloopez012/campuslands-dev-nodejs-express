import app from "./app.js";

const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
  console.log(`API de futbol escuchando en http://localhost:${PORT}`);
});
