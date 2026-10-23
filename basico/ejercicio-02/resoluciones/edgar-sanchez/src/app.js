import { createLoadout } from "./services/loadout.service.js";

function main() {
  const playerName = process.argv.length > 2 ? process.argv[2] : "Operador";

  try {
    const loadout = createLoadout(playerName);
    console.log("Loadout asignado:");
    console.table(loadout);
  } catch (error) {
    console.error(`Error al asignar el loadout: ${error.message}`);
    process.exitCode = 1;
  }
}

main();