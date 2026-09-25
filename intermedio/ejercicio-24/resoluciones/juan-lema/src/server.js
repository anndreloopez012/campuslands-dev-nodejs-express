import app from "./app.js";

const PORT = process.env.PORT || 4024;

app.listen(PORT, () => {
  console.log(`API de formulas quimicas escuchando en http://localhost:${PORT}`);
});
