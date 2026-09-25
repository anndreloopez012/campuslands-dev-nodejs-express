// Aqui cada creacion, actualizacion o borrado se ESCRIBE de vuelta al archivo
// con writeFile, asi que los cambios sobreviven a un reinicio del
// servidor. Este es el CRUD "de referencia": las 5 operaciones basicas
// con persistencia real.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_FORMULAS = path.join(__dirname, '..', 'data', 'formulas.json');

async function leerFormulas() {
  const contenido = await readFile(RUTA_FORMULAS, 'utf-8');
  return JSON.parse(contenido);
}

async function guardarFormulas(formulas) {
  await writeFile(RUTA_FORMULAS, JSON.stringify(formulas, null, 2), 'utf-8');
}

export async function listarFormulas() {
  return leerFormulas();
}

export async function buscarFormulaPorId(id) {
  const formulas = await leerFormulas();
  return formulas.find((formula) => formula.id === Number(id)) || null;
}

export async function crearFormula({ nombre, formula, tipo, estado }) {
  const formulas = await leerFormulas();
  const siguienteId = formulas.length > 0 ? Math.max(...formulas.map((f) => f.id)) + 1 : 1;

  const nuevaFormula = { id: siguienteId, nombre, formula, tipo, estado };
  formulas.push(nuevaFormula);
  await guardarFormulas(formulas);

  return nuevaFormula;
}

export async function actualizarFormula(id, { nombre, formula, tipo, estado }) {
  const formulas = await leerFormulas();
  const indice = formulas.findIndex((f) => f.id === Number(id));

  if (indice === -1) {
    return null;
  }

  formulas[indice] = { id: Number(id), nombre, formula, tipo, estado };
  await guardarFormulas(formulas);

  return formulas[indice];
}

export async function eliminarFormula(id) {
  const formulas = await leerFormulas();
  const indice = formulas.findIndex((f) => f.id === Number(id));

  if (indice === -1) {
    return false;
  }

  formulas.splice(indice, 1);
  await guardarFormulas(formulas);

  return true;
}
