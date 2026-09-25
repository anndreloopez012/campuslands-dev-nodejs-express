import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_DATA = path.join(__dirname, '..', 'data', 'hiperdeportivos.json');

export async function listarHiperdeportivos() {
  const contenido = await readFile(RUTA_DATA, 'utf-8');
  return JSON.parse(contenido);
}

export async function obtenerResumen() {
  const autos = await listarHiperdeportivos();

  const autoDestacado = autos.find(
    (auto) => auto.marca.toLowerCase() === env.MARCA_DESTACADA.toLowerCase()
  );

  const dentroDelLimite = autos.filter(
    (auto) => auto.velocidad_maxima_kmh <= env.LIMITE_VELOCIDAD_KMH
  );

  return {
    marca_destacada: env.MARCA_DESTACADA,
    limite_velocidad_kmh: env.LIMITE_VELOCIDAD_KMH,
    auto_destacado: autoDestacado || null,
    total_dentro_del_limite: dentroDelLimite.length,
  };
}
