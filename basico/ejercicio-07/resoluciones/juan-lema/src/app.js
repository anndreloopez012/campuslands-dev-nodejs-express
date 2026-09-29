import { parseArgs, quoteCar } from "./services/quote.service.js";

function main() {
  const flags = parseArgs(process.argv.slice(2));

  try {
    const quote = quoteCar(flags);
    console.log("Cotizacion generada:");
    console.table(quote);
  } catch (error) {
    console.error(`Error al cotizar: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
