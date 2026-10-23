import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/streetFood.json");

const readFoodFile = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

const writeFoodFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
};

export const getAllStreetFoodService = async () => {
  return await readFoodFile();
};

export const getStreetFoodByIdService = async (id) => {
  const foods = await readFoodFile();
  return foods.find((item) => item.id === String(id));
};

export const createStreetFoodService = async ({ name, category, price, spicyLevel, available }) => {
  const foods = await readFoodFile();

  const nameExists = foods.some(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  if (nameExists) {
    const error = new Error(`El platillo de comida urbana '${name}' ya existe en el menú.`);
    error.statusCode = 409;
    throw error;
  }

  const newItem = {
    id: String(Date.now()),
    name,
    category,
    price: Number(price),
    spicyLevel: Number(spicyLevel),
    available: available !== undefined ? Boolean(available) : true
  };

  foods.push(newItem);
  await writeFoodFile(foods);

  return newItem;
};