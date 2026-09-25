import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_MODELOS = path.join(__dirname, '..', 'data', 'modelos.json');

const PRECIO_POR_M2_USD = {
  concreto: 450,
  madera: 380,
  acero: 620,
  vidrio: 700,
};

let modelos = null;
let siguienteId = null;

async function cargarModelos() {
  if (modelos === null) {
    const contenido = await readFile(RUTA_MODELOS, 'utf-8');
    modelos = JSON.parse(contenido);
    siguienteId = modelos.length > 0 ? Math.max(...modelos.map((m) => m.id)) + 1 : 1;
  }

  return modelos;
}

// Funcion pura: no lee archivos, no sabe de Express. Facil de probar
// aparte, con solo pasarle numeros/strings.
export function calcularCostoEstimado(areaM2, material) {
  const precioM2 = PRECIO_POR_M2_USD[material];

  if (precioM2 === undefined) {
    throw new Error(`Material desconocido: ${material}`);
  }

  return Math.round(areaM2 * precioM2);
}

export async function listarModelosConCosto() {
  const lista = await cargarModelos();

  return lista.map((modelo) => ({
    ...modelo,
    costo_estimado_usd: calcularCostoEstimado(modelo.area_m2, modelo.material),
  }));
}

export async function buscarModeloPorId(id) {
  const lista = await listarModelosConCosto();
  return lista.find((modelo) => modelo.id === Number(id)) || null;
}

export async function crearModelo({ nombre, area_m2, material }) {
  const lista = await cargarModelos();

  const nuevoModelo = { id: siguienteId, nombre, area_m2, material };
  siguienteId += 1;
  lista.push(nuevoModelo);

  return {
    ...nuevoModelo,
    costo_estimado_usd: calcularCostoEstimado(area_m2, material),
  };
}

// Otro servicio simple, que reutiliza el anterior: agrega datos ya
// calculados en vez de repetir la formula.
export async function obtenerResumen() {
  const lista = await listarModelosConCosto();

  const costoTotal = lista.reduce((total, modelo) => total + modelo.costo_estimado_usd, 0);

  const modeloMasCostoso = lista.reduce(
    (mayor, modelo) =>
      modelo.costo_estimado_usd > (mayor?.costo_estimado_usd ?? -1) ? modelo : mayor,
    null
  );

  return {
    total_modelos: lista.length,
    costo_total_estimado_usd: costoTotal,
    modelo_mas_costoso: modeloMasCostoso ? modeloMasCostoso.nombre : null,
  };
}
