import app from "./app.js";

const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`API de MOBA esports escuchando en http://localhost:${PORT}`);
});
