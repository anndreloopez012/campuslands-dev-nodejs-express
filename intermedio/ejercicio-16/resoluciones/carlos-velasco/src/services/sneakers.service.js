const sneakers = [
  { id: 1, modelo: 'Corri Andes', marca: 'Suela Sur', talle: 40, stock: 12, precio_usd: 110 },
  { id: 2, modelo: 'Nube Urbana', marca: 'Suela Sur', talle: 42, stock: 0, precio_usd: 145 },
  { id: 3, modelo: 'Pique Retro', marca: 'Old Court', talle: 38, stock: 5, precio_usd: 89 }
];

function listarVisible() {
  // Vista de cliente: solo tallas y modelos sin elegir marca interna
  return sneakers.map(({ id, modelo, marca, talle, stock, precio_usd }) => ({
    id, modelo, marca, talle, disponible: stock > 0, precio_usd
  }));
}

function listarCompleto() {
  return sneakers;
}

function ajustarStock(id, datos) {
  const item = sneakers.find((actual) => actual.id === id);
  if (!item) return null;

  const { operacion, cantidad } = datos;
  if (!['entrada', 'salida'].includes(operacion)) return { error: 'Operacion invalida: usa "entrada" o "salida"' };
  if (!Number.isInteger(cantidad) || cantidad <= 0) return { error: 'El campo "cantidad" debe ser un entero positivo' };

  if (operacion === 'entrada') {
    item.stock += cantidad;
  } else {
    if (item.stock < cantidad) return { error: `Stock insuficiente (actual: ${item.stock})` };
    item.stock -= cantidad;
  }
  return { data: item };
}

module.exports = { listarVisible, listarCompleto, ajustarStock };
