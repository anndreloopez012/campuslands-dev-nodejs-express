import app from "./app.js";

const PORT = process.env.PORT || 3018;

app.listen(PORT, () => {
  console.log(`API de paracaidismo escuchando en http://localhost:${PORT}`);
});
