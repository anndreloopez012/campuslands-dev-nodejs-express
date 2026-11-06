import { listFighters, addFighter } from "./services/fighters.service.js";

async function main() {
  const [name, weight] = process.argv.slice(2);

  try {
    if (name) {
      const created = await addFighter({ name, weight });
      console.log("Peleador agregado:");
      console.table(created);
    }

    const fighters = await listFighters();
    console.log("Peleadores registrados:");
    console.table(fighters);
  } catch (error) {
    console.error(`Error de persistencia: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
