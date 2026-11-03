import app from "./app.js";
import { config } from "./config/env.config.js";

const { port, nodeEnv } = config.server;
const { name } = config.workshop;

app.listen(port, () => {
  console.log(`[${name}] Servidor activo en http://localhost:${port} [Modo: ${nodeEnv}]`);
});
