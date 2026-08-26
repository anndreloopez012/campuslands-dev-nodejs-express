import app from "./app.js";

const PORT = process.env.PORT || 3026;

app.listen(PORT, () => {
  console.log(`API de shooters escuchando en http://localhost:${PORT}`);
});
