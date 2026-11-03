import app from "./app.js";

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`[Chemical Formulas Service API] Servidor activo en http://localhost:${PORT} [Modo: ${NODE_ENV}]`);
});
