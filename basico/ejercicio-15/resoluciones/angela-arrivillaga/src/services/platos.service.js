const platos = [
  { id: 1, nombre: 'Hot dog', precio: 15 },
  { id: 2, nombre: 'Tacos al pastor', precio: 25 },
  { id: 3, nombre: 'Hamburguesa', precio: 40 }
];

export function getPlatos() {
  return platos;
}

export function buscarPlato(id) {
  return platos.find((p) => p.id === id);
}

export function agregarPlato(nombre, precio) {
  const nuevo = {
    id: platos.length + 1,
    nombre: nombre,
    precio: precio
  };

  platos.push(nuevo);
  return nuevo;
}
