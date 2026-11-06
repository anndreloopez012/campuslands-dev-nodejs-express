import { createCharacter } from "./services/character.service.js";

function printRuntimeInfo() {
  console.log("=== RPG Node runtime ===");
  console.log(`Node version: ${process.version}`);
  console.log(`Plataforma: ${process.platform}`);
  console.log(`PID: ${process.pid}`);
}

function main() {
  printRuntimeInfo();

  const nameArg = process.argv[2] || "Aldric";

  try {
    const character = createCharacter(nameArg);
    console.log("\nPersonaje creado:");
    console.table(character);
  } catch (error) {
    console.error(`Error al crear personaje: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
