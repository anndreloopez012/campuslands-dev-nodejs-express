import { readFile } from 'node:fs/promises';
const JSON_PATH = new URL('../data/products.json', import.meta.url);

const readProductsFile = async () => {
  const content = await readFile(JSON_PATH, 'utf-8');
  return JSON.parse(content);
};

export const getAllProducts = async () => {
  try {
    const products = await readProductsFile();

    return products;
  } catch (error) {
    throw new Error('Error al obtener los productos: ' + error.message);
  }
};

export const getProductById = async (id) => {
  try {
    const products = await readProductsFile();
    const product = products.find(e => e.id === Number(id));
    return product || null;
  } catch (error) {
    throw new Error('Error al obtener el producto: ' + error.message);
  }
};