import { getPlayerById } from "./services/players.service.js";

async function main() {
  const idArg = process.argv[2] || 1;

  try {
    const player = await getPlayerById(idArg);
    console.log("Jugador encontrado:");
    console.table(player);
  } catch (error) {
    console.error(`Error al leer jugador: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
