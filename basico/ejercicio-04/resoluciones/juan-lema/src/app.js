import shrinkZone, { MAX_RADIUS } from "./services/zone.service.js";

function main() {
  const radiusArg = Number(process.argv[2]) || MAX_RADIUS;

  try {
    const zone = shrinkZone(radiusArg);
    console.log(`Radio maximo del mapa: ${MAX_RADIUS}`);
    console.log("Zona reducida:");
    console.table(zone);
  } catch (error) {
    console.error(`Error al reducir zona: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
