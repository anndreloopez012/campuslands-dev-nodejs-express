import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, "..", "data", "destinations.json");

const loadData = async () => {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
};

export const getAll = async () => loadData();

export const getById = async (id) => {
  if (isNaN(id)) return { error: "El id debe ser numérico", status: 400 };

  const destinations = await loadData();
  const dest = destinations.find((d) => d.id === Number(id));

  if (!dest) return { error: "Destino no encontrado", status: 404 };
  return { data: dest };
};
