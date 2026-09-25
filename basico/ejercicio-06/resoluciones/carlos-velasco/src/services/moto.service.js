import path from "node:path";
import { readFile } from "node:fs/promises";

const motosDirectory = path.resolve("src/data/motos");

export const getMotoByFileName = async (fileName) => {
    const safeFileName = path.basename(fileName);

    const filePath = path.join(motosDirectory, safeFileName);

    const content = await readFile(filePath, "utf-8");

    return JSON.parse(content);
};