import app from "./app.js";
import { envConfig } from "./config/env.config.js";

app.listen(envConfig.port, () => {
  console.log(`[Hypercars API] Servidor iniciado`);
  console.log(` -> Entorno: ${envConfig.nodeEnv}`);
  console.log(` -> Puerto: ${envConfig.port}`);
  console.log(` -> URL: http://localhost:${envConfig.port}/api/v1/hypercars`);
});