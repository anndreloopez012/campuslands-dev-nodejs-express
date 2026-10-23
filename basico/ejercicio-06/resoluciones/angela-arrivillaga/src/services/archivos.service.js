import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carpetaData = path.join(__dirname, '..', 'data');

export function listarArchivos() {
  return fs.readdirSync(carpetaData);
}

export function leerArchivoSeguro(nombre) {
  const rutaFinal = path.resolve(carpetaData, nombre);

  if (!rutaFinal.startsWith(carpetaData + path.sep)) {
    return { error: 'invalido' };
  }

  if (!fs.existsSync(rutaFinal)) {
    return { error: 'noexiste' };
  }

  const contenido = fs.readFileSync(rutaFinal, 'utf-8');
  return { contenido: contenido };
}

export function obtenerInfoRuta(ruta) {
  return {
    nombreArchivo: path.basename(ruta),
    extension: path.extname(ruta),
    carpeta: path.dirname(ruta)
  };
}
