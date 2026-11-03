const { pickHero } = require("./services/hero.service");

function main() {
  const teamArg = process.argv.length > 2 ? process.argv[2] : "Radiant Esports";

  try {
    const pick = pickHero(teamArg);
    console.log("Seleccion de heroe en draft MOBA:");
    console.table(pick);
  } catch (error) {
    console.error(`Error al elegir heroe: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
