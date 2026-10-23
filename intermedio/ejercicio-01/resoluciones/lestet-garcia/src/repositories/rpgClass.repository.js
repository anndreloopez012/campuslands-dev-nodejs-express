import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/rpgClasses.json");

export const findAllClasses = async () => {
  const data = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(data);
};

export const findClassById = async (id) => {
  const classes = await findAllClasses();
  return classes.find((c) => c.id === String(id)) || null;
};

export const findClassByName = async (className) => {
  const classes = await findAllClasses();
  return classes.find((c) => c.className.toLowerCase() === className.toLowerCase()) || null;
};

export const saveClass = async (newClassData) => {
  const classes = await findAllClasses();
  classes.push(newClassData);
  await fs.writeFile(DATA_PATH, JSON.stringify(classes, null, 2), "utf-8");
  return newClassData;
};

export const updateClassInStore = async (id, updatedData) => {
  const classes = await findAllClasses();
  const index = classes.findIndex((c) => c.id === String(id));

  if (index === -1) return null;

  classes[index] = { ...classes[index], ...updatedData, id: String(id) };
  await fs.writeFile(DATA_PATH, JSON.stringify(classes, null, 2), "utf-8");
  return classes[index];
};

export const deleteClassFromStore = async (id) => {
  const classes = await findAllClasses();
  const index = classes.findIndex((c) => c.id === String(id));

  if (index === -1) return false;

  classes.splice(index, 1);
  await fs.writeFile(DATA_PATH, JSON.stringify(classes, null, 2), "utf-8");
  return true;
};