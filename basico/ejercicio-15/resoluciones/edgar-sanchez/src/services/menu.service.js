import { readFile } from "node:fs/promises";

const MENU_FILE = new URL("../data/menu.json", import.meta.url);

let menuPromise;

async function readMenu() {
  const rawMenu = await readFile(MENU_FILE, "utf8");
  let menu;

  try {
    menu = JSON.parse(rawMenu);
  } catch (error) {
    throw new Error("El archivo del menú contiene JSON inválido", { cause: error });
  }

  if (!Array.isArray(menu)) {
    throw new Error("El archivo del menú debe contener un arreglo");
  }

  return menu;
}

export function getMenu() {
  if (!menuPromise) {
    menuPromise = readMenu().catch((error) => {
      menuPromise = undefined;
      throw error;
    });
  }

  return menuPromise;
}

export async function findMenuItem(id) {
  const menu = await getMenu();
  return menu.find((item) => item.id === id) ?? null;
}

export function clearMenuCache() {
  menuPromise = undefined;
}