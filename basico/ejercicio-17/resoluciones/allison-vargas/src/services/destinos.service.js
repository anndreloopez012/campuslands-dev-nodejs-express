import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_DESTINOS = path.join(__dirname, '..', 'data', 'destinos.json');

async function cargarDestinos() {
  const contenido = await readFile(RUTA_DESTINOS, 'utf-8');
  return JSON.parse(contenido);
}

// Filtros opcionales que llegan como query params (?pais=...&precioMax=...)
export async function listarDestinos({ pais, precioMax } = {}) {
  const destinos = await cargarDestinos();

  return destinos.filter((destino) => {
    if (pais && destino.pais.toLowerCase() !== pais.toLowerCase()) {
      return false;
    }

    if (precioMax && destino.precio_desde_usd > Number(precioMax)) {
      return false;
    }

    return true;
  });
}

export async function listarDestinosPopulares() {
  const destinos = await cargarDestinos();
  return destinos.filter((destino) => destino.popular);
}

export async function buscarDestinoPorId(id) {
  const destinos = await cargarDestinos();
  return destinos.find((destino) => destino.id === Number(id)) || null;
}
