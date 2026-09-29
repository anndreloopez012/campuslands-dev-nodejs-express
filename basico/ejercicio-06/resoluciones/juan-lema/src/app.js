import { readManual } from "./services/manuals.service.js";

async function main() {
  const partArg = process.argv[2] || "frenos";

  try {
    const manual = await readManual(partArg);
    console.log("Manual encontrado:");
    console.table(manual);
  } catch (error) {
    console.error(`Error al leer manual: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
