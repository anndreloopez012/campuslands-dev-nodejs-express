import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const target = process.env.DATA_FILE ?? "data/db.json";
const seed = new URL("../../data/seed.json", import.meta.url);

await mkdir(dirname(target), { recursive: true });
await copyFile(seed, target);
console.log(`Base de datos restaurada desde la semilla en ${target}`);
