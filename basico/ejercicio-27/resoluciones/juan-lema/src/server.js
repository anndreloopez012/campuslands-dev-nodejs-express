import app from "./app.js";

const PORT = process.env.PORT || 3027;

app.listen(PORT, () => {
  console.log(`API MOBA escuchando en http://localhost:${PORT}`);
});
