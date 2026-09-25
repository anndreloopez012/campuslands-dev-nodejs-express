import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = fileURLToPath(new URL("../data/", import.meta.url));

async function readService(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("La ruta solo permite letras, numeros y guiones");
  }

  const filePath = resolve(DATA_DIR, `${slug}.json`);
  const pathFromData = relative(DATA_DIR, filePath);

  if (pathFromData.startsWith("..") || isAbsolute(pathFromData)) {
    throw new Error("Ruta no permitida");
  }

  return JSON.parse(await readFile(filePath, "utf8"));
}

export { readService };