import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Avanzado 18 - multirol avanzado] Servidor activo en http://localhost:${PORT}`);
});
