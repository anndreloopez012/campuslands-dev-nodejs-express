import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Avanzado 03 - validacion con schemas] Servidor activo en http://localhost:${PORT}`);
});
