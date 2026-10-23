import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SPECS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "specs");

function readSpec(model) {
    if (!model || typeof model !== "string" || !model.trim()) {
        throw new Error("El modelo de la moto es obligatorio");
    }

    const safeModel = path.normalize(model.trim()).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(SPECS_DIR, `${safeModel}.txt`);
    const relative = path.relative(SPECS_DIR, filePath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Ruta de ficha tecnica invalida");
    }

    try {
        const content = readFileSync(filePath, "utf-8");
        return { model: safeModel, content: content.trim() };
    } catch {
        throw new Error(`Ficha tecnica de "${safeModel}" no encontrada`);
    }
}

export { readSpec };