import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  ENTRADA_PELIGROSA: [400, () => 'La entrada tiene una estructura no permitida'],
  PRODUCTO_NO_ENCONTRADO: [404, (c) => `No existe el producto ${c.productoId}`],
  SKU_DUPLICADO: [409, (c) => `Ya existe un producto con el sku ${c.sku}`],
};
