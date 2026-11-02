const auto = process.argv[2];

if (!auto) {
  console.log('Debes indicar un auto.');
  process.exit(1);
}

console.log(`Auto seleccionado: ${auto}`);