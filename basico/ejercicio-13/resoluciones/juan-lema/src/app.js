import { jumpToSystem } from "./services/warp.service.js";
import { InvalidCoordinatesError, InsufficientFuelError, WarpError } from "./services/errors.js";

function main() {
  const [system, fuel] = process.argv.slice(2);

  try {
    const jump = jumpToSystem({ system, fuel });
    console.log("Salto exitoso:");
    console.table(jump);
  } catch (error) {
    if (error instanceof InvalidCoordinatesError) {
      console.error(`Error de navegacion: ${error.message}`);
    } else if (error instanceof InsufficientFuelError) {
      console.error(`Error de combustible: ${error.message}`);
    } else if (error instanceof WarpError) {
      console.error(`Error de salto: ${error.message}`);
    } else {
      console.error(`Error inesperado: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

main();
