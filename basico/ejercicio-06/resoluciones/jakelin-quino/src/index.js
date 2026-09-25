const path = require('node:path');

const dataDirectory = path.resolve(__dirname, '..', 'data');
const requestedFile = process.argv[2] || 'motos.json';
const safePath = path.resolve(dataDirectory, requestedFile);

if (!safePath.startsWith(`${dataDirectory}${path.sep}`)) {
  console.error('Error: la ruta solicitada esta fuera de la carpeta permitida.');
  process.exitCode = 1;
} else {
  console.log('Directorio de datos:', dataDirectory);
  console.log('Archivo seguro:', safePath);
}