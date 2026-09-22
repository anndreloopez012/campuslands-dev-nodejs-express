import { loadConfig } from "./config/index.js";
import { createApp } from "./app.js";

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(`No se pudo iniciar: ${error.message}`);
  process.exit(1);
}

createApp({ jwtSecret: config.jwtSecret, jwtExpiresIn: config.jwtExpiresIn }).listen(config.port, () => {
  console.log(`API de taller de motos (${config.env}) escuchando en http://localhost:${config.port}`);
});
