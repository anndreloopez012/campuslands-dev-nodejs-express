const carsService = require("./services/cars.service");

const args = process.argv.slice(2);

const command = args[0];

function showHelp() {
  console.log(`
CLI - Autos de lujo

Comandos disponibles:

  npm run cli -- listar
  npm run cli -- buscar Ferrari
  npm run cli -- buscar Porsche
  npm run cli -- ayuda
`);
}

function listCars() {
  const cars = carsService.getCars();

  console.log("\nAutos de lujo disponibles:\n");

  cars.forEach((car) => {
    console.log(
      `${car.marca} ${car.modelo} - ${car.anio} - $${car.precio}`
    );
  });
}

function searchCars(brand) {
  if (!brand) {
    console.log("Error: debes indicar una marca.");
    console.log("Ejemplo: npm run cli -- buscar Ferrari");
    return;
  }

  const cars = carsService.findCarsByBrand(brand);

  if (cars.length === 0) {
    console.log(`No se encontraron autos de la marca: ${brand}`);
    return;
  }

  console.log(`\nAutos encontrados para ${brand}:\n`);

  cars.forEach((car) => {
    console.log(
      `${car.marca} ${car.modelo} - ${car.anio} - $${car.precio}`
    );
  });
}

switch (command) {
  case "listar":
    listCars();
    break;

  case "buscar":
    searchCars(args[1]);
    break;

  case "ayuda":
  case undefined:
    showHelp();
    break;

  default:
    console.log(`Comando no reconocido: ${command}`);
    showHelp();
}