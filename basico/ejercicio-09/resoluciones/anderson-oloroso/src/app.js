import { listFighters, addFighter } from "./services/fighters.service.js";

const args = process.argv.slice(2);

async function main() {
  try {
    if (args.length === 0) {
      const fighters = await listFighters();
      console.log("\n🥊 Lista de Peleadores de Kickboxing:\n");
      fighters.forEach((f) => {
        console.log(
          `  [${f.id}] ${f.name} - ${f.weight}kg | W:${f.wins} L:${f.losses} KO:${f.ko}`
        );
      });
      console.log(`\n  Total: ${fighters.length} peleadores\n`);
    } else if (args.length === 2) {
      const [name, weight] = args;
      const fighter = await addFighter(name, weight);
      console.log("\n🥊 Peleador agregado exitosamente:");
      console.log(
        `  [${fighter.id}] ${fighter.name} - ${fighter.weight}kg\n`
      );
    } else {
      console.log("Uso:");
      console.log("  node src/app.js              → Listar peleadores");
      console.log('  node src/app.js "Nombre" 75  → Agregar peleador');
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
