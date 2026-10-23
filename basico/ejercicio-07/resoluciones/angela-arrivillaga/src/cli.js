import { getAutos, buscarPorMarca } from './services/autos.service.js';

const args = process.argv.slice(2);
const comando = args[0];

if (comando === 'listar') {
  const autos = getAutos();
  for (let i = 0; i < autos.length; i++) {
    console.log(autos[i].id + ' - ' + autos[i].marca + ' ' + autos[i].modelo + ' - $' + autos[i].precio);
  }
} else if (comando === 'buscar') {
  const marca = args[1];

  if (!marca) {
    console.log('Falta la marca. Ejemplo: node src/cli.js buscar Bentley');
    process.exit(1);
  }

  const encontrados = buscarPorMarca(marca);

  if (encontrados.length === 0) {
    console.log('No se encontraron autos de la marca ' + marca);
  } else {
    for (let i = 0; i < encontrados.length; i++) {
      console.log(encontrados[i].marca + ' ' + encontrados[i].modelo);
    }
  }
} else {
  console.log('Comando no valido');
  console.log('Usa: node src/cli.js listar');
  console.log('Usa: node src/cli.js buscar <marca>');
  process.exit(1);
}
