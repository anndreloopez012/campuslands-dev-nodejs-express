// Básico 07: process.argv y CLI (Autos de lujo)
import { parseCliArguments, searchCars } from './services/carsCli.service.js';

function main() {
  const rawArgs = process.argv.slice(2);
  const flags = parseCliArguments(rawArgs);

  if (flags.help) {
    console.log('=== CLI CONCIERGE DE AUTOS DE LUJO ===');
    console.log('Uso: node src/app.js [opciones]');
    console.log('\nOpciones:');
    console.log('  --brand <marca>       Filtra por marca (Ferrari, Porsche, Lamborghini, Rolls-Royce)');
    console.log('  --minPrice <monto>    Precio mínimo en USD');
    console.log('  --maxPrice <monto>    Precio máximo en USD');
    console.log('  --help                Muestra esta ayuda');
    return;
  }

  console.log('=== CATÁLOGO EXCLUSIVO DE AUTOS DE LUJO (CLI) ===');
  const results = searchCars({
    brand: flags.brand,
    minPrice: flags.minPrice,
    maxPrice: flags.maxPrice
  });

  if (results.length === 0) {
    console.log('\nNo se encontraron vehículos que coincidan con los criterios de búsqueda.');
    return;
  }

  console.log(`\nVehículos encontrados: ${results.length}`);
  console.table(results);
}

main();
