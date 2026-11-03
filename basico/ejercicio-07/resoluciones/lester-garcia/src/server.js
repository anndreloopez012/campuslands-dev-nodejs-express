import app from "./app.js";
import { parseCliArguments } from "./config/cli.config.js";

const cliConfig = parseCliArguments();

// Guardamos la moneda leída por CLI dentro de las configuraciones de la app Express
app.set("defaultCurrency", cliConfig.currency);

app.listen(cliConfig.port, () => {
  console.log(`[Luxury Cars API] Servidor iniciado vía CLI`);
  console.log(` -> Puerto: ${cliConfig.port}`);
  console.log(` -> Moneda predeterminada: ${cliConfig.currency}`);
  console.log(` -> URL: http://localhost:${cliConfig.port}/api/v1/cars`);
});