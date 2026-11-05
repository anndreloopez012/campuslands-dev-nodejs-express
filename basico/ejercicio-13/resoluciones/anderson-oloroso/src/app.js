import { calculateWarp } from "./services/warp.service.js";
import { InvalidCoordinatesError, InsufficientFuelError } from "./services/errors.js";

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("Uso: node src/app.js <destino> <combustible>");
  console.log('Ejemplo: node src/app.js "Andrómeda" 80');
  console.log("\nDestinos válidos: Andrómeda, Kepler-442b, Próxima Centauri, Trappist-1e, Titán, Europa");
  process.exit(0);
}

const [destination, fuel] = args;

try {
  const result = calculateWarp(destination, fuel);

  console.log("\n🚀 ¡Salto Warp Exitoso!");
  console.log(`  Destino:             ${result.destination}`);
  console.log(`  Combustible usado:   ${result.fuelUsed} u`);
  console.log(`  Combustible restante: ${result.fuelRemaining} u`);
  console.log(`  Tiempo de viaje:     ${result.travelTime}`);
  console.log(`  Estado:              ${result.status}\n`);
} catch (error) {
  if (error instanceof InvalidCoordinatesError) {
    console.error(`\n🛑 Error de Coordenadas: ${error.message}`);
    console.error("   Verifica que el destino sea válido.\n");
  } else if (error instanceof InsufficientFuelError) {
    console.error(`\n⛽ Error de Combustible: ${error.message}`);
    console.error(`   Necesitas al menos ${error.required} unidades.\n`);
  } else {
    console.error(`\n❌ Error inesperado: ${error.message}\n`);
  }
  process.exit(1);
}
