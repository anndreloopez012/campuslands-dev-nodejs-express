import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaJson = path.join(__dirname, '..', 'data', 'peleadores.json');

export function leerPeleadores() {
  const texto = fs.readFileSync(rutaJson, 'utf-8');
  return JSON.parse(texto);
}

export function agregarPeleador(datos) {
  const peleadores = leerPeleadores();
  let nuevoId = 1;

  if (peleadores.length > 0) {
    nuevoId = peleadores[peleadores.length - 1].id + 1;
  }

  const nuevo = {
    id: nuevoId,
    nombre: datos.nombre,
    peso: datos.peso,
    victorias: datos.victorias
  };

  peleadores.push(nuevo);
  fs.writeFileSync(rutaJson, JSON.stringify(peleadores, null, 2));

  return nuevo;
}
