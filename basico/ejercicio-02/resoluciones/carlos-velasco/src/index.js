// src/index.js
import { getAllProducts, getProductById } from './services/products.service.js';

async function probarLógica() {
  console.log('--- 1. Probando obtener todos los productos ---');
  const productos = await getAllProducts();
  console.log(productos);

  console.log('\n--- 2. Probando obtener el producto con ID 1 ---');
  const producto = await getProductById(1);
  console.log(producto);
}

probarLógica();