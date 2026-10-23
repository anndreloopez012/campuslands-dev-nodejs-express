import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio base permitido para los manuales
const MANUALS_DIR = path.resolve(__dirname, "../data/manuals");

export const getManualByModelService = async (filename) => {
  // 1. Sanitizar el nombre del archivo eliminando secuencias peligrosas de navegación
  const safeFilename = path.basename(filename);

  // 2. Construir la ruta absoluta usando path.join / path.resolve
  const targetPath = path.resolve(MANUALS_DIR, safeFilename);

  // 3. Validar que la ruta final esté estrictamente dentro del directorio MANUALS_DIR
  if (!targetPath.startsWith(MANUALS_DIR)) {
    const error = new Error("Acceso no autorizado: la ruta está fuera del directorio permitido.");
    error.code = "FORBIDDEN";
    throw error;
  }

  // 4. Leer el archivo de forma asíncrona
  const fileContent = await fs.readFile(targetPath, "utf-8");
  return JSON.parse(fileContent);
};