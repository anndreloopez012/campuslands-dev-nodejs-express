import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/apparel.json");

const readApparelFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeApparelFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllApparelService = async () => {
  return await readApparelFile();
};

export const getApparelByIdService = async (id) => {
  const items = await readApparelFile();
  const item = items.find((i) => i.id === String(id));

  if (!item) {
    throw new NotFoundError(`El artículo con ID '${id}' no existe en el catálogo.`);
  }

  return item;
};

export const createApparelService = async ({ name, brand, category, size, price, inStock }) => {
  const items = await readApparelFile();

  const nameExists = items.some(
    (i) => i.name.toLowerCase() === name.toLowerCase() && String(i.size).toLowerCase() === String(size).toLowerCase()
  );

  if (nameExists) {
    throw new ConflictError(`El artículo '${name}' en talla '${size}' ya se encuentra en el inventario.`);
  }

  const newItem = {
    id: String(Date.now()),
    name,
    brand,
    category,
    size,
    price: Number(price),
    inStock: inStock !== undefined ? Boolean(inStock) : true
  };

  items.push(newItem);
  await writeApparelFile(items);

  return newItem;
};