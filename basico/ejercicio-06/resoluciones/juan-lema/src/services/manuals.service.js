import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MANUALS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "manuals");

async function readManual(partName) {
  if (!partName || typeof partName !== "string" || !partName.trim()) {
    throw new Error("El nombre de la pieza es obligatorio");
  }

  const safeName = path.basename(partName.trim());
  const filePath = path.resolve(MANUALS_DIR, `${safeName}.txt`);

  if (!filePath.startsWith(MANUALS_DIR + path.sep)) {
    throw new Error("Ruta de manual invalida");
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return { part: safeName, content: content.trim() };
  } catch {
    throw new Error(`Manual de "${safeName}" no encontrado`);
  }
}

export { readManual };
