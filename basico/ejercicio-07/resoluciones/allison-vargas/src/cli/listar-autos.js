import { listarAutos, filtrarPorMarca } from '../services/autos.service.js';

function leerArgumento(nombre) {
  const prefijo = `--${nombre}=`;
  const argumentoEncontrado = process.argv.find((arg) => arg.startsWith(prefijo));
  return argumentoEncontrado ? argumentoEncontrado.slice(prefijo.length) : null;
}

async function main() {
  const marcaFiltro = leerArgumento('marca');
  const autos = marcaFiltro ? await filtrarPorMarca(marcaFiltro) : await listarAutos();

  console.log('==================================');
  console.log(' Catalogo de autos de lujo (CLI)');
  console.log('==================================');

  if (marcaFiltro) {
    console.log(`Filtrando por marca: ${marcaFiltro}`);
  }

  if (autos.length === 0) {
    console.log('No se encontraron autos con ese filtro.');
    return;
  }

  console.table(autos);
}

main();
