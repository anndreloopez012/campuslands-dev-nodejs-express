import app from "./app.js";

const PORT = process.env.PORT || 4007;

app.listen(PORT, () => {
  console.log(`API de autos de lujo escuchando en http://localhost:${PORT}`);
});
