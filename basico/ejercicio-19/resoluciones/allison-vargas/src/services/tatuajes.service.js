import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUTA_ARTISTAS = path.join(__dirname, '..', 'data', 'artistas.json');
const RUTA_DISENOS = path.join(__dirname, '..', 'data', 'disenos.json');

async function cargarArtistas() {
  const contenido = await readFile(RUTA_ARTISTAS, 'utf-8');
  return JSON.parse(contenido);
}

async function cargarDisenos() {
  const contenido = await readFile(RUTA_DISENOS, 'utf-8');
  return JSON.parse(contenido);
}

export async function buscarArtistaPorId(artistaId) {
  const artistas = await cargarArtistas();
  return artistas.find((artista) => artista.id === Number(artistaId)) || null;
}

// req.params (artistaId) combinado con req.query (estilo, precioMax)
export async function listarDisenosDeArtista(artistaId, { estilo, precioMax } = {}) {
  const disenos = await cargarDisenos();

  return disenos.filter((diseno) => {
    if (diseno.artistaId !== Number(artistaId)) return false;
    if (estilo && diseno.estilo.toLowerCase() !== estilo.toLowerCase()) return false;
    if (precioMax && diseno.precio_usd > Number(precioMax)) return false;
    return true;
  });
}

// No basta con que exista el diseno con ese id, tiene que
// pertenecer justo a ese artistaId.
export async function buscarDisenoDeArtista(artistaId, disenoId) {
  const disenos = await cargarDisenos();

  return (
    disenos.find(
      (diseno) => diseno.artistaId === Number(artistaId) && diseno.id === Number(disenoId)
    ) || null
  );
}
