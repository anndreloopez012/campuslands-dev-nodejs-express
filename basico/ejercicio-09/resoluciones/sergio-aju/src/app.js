import fs from 'fs/promises';

const archivo = './data/peleadores.json';

const comando = process.argv[2];

async function listar() {
  const datos = await fs.readFile(archivo, 'utf-8');
  console.log(JSON.parse(datos));
}

async function agregar() {
  const nombre = process.argv[3];
  const deporte = process.argv[4];

  if (!nombre || !deporte) {
    console.log('Debes indicar nombre y deporte.');
    return;
  }

  const datos = await fs.readFile(archivo, 'utf-8');
  const peleadores = JSON.parse(datos);

  peleadores.push({
    nombre,
    deporte
  });

  await fs.writeFile(
    archivo,
    JSON.stringify(peleadores, null, 2)
  );

  console.log('Peleador guardado correctamente.');
}

if (comando === 'listar') {
  await listar();
} else if (comando === 'agregar') {
  await agregar();
} else {
  console.log('Usa: listar o agregar');
}