const { pickHero } = require("./services/hero.service");

function main() {
  const teamName = process.argv.length > 2 ? process.argv[2] : "Radiant";

  try {
    const pick = pickHero(teamName);
    console.log("Pick de heroe:");
    console.table(pick);
  } catch (error) {
    console.error(`Error al elegir heroe: ${error.message}`);
    process.exitCode = 1;
  }
}

main();