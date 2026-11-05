let inventory = [
  { id: 1, item: 'Poción de Vida Mayor', tipo: 'Consumible', cantidad: 5, valorOro: 50 },
  { id: 2, item: 'Espada de Mitril', tipo: 'Arma', cantidad: 1, valorOro: 450 }
];

export const getInventory = () => inventory;

export const getItemById = (id) => {
  const item = inventory.find(i => i.id === Number(id));
  if (!item) {
    const err = new Error(`Item con ID ${id} no encontrado en el inventario.`);
    err.statusCode = 404;
    throw err;
  }
  return item;
};

export const addItem = ({ item, tipo, cantidad, valorOro }) => {
  const id = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
  const newItem = { id, item, tipo, cantidad: Number(cantidad), valorOro: Number(valorOro) };
  inventory.push(newItem);
  return newItem;
};
