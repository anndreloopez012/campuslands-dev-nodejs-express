import { playRally } from "./services/rally.service.js";

function main() {
  const playerArg = process.argv.length > 2 ? process.argv[2] : "Ana";

  console.log("Sacando saque...");

  playRally(playerArg, (error, result) => {
    if (error) {
      console.error(`Error en el rally: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log("Rally terminado:");
    console.table(result);
  });

  console.log("Esta linea se imprime antes del resultado (funcion asincrona no bloqueante)");
}

main();
