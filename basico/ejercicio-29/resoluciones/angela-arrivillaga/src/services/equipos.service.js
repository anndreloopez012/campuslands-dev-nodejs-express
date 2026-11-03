const equipos = [
  { id: 1, nombre: 'Aguilas FC', ciudad: 'Guatemala', jugadores: 18 },
  { id: 2, nombre: 'Futsal Pro', ciudad: 'Antigua', jugadores: 10 },
  { id: 3, nombre: 'Leones United', ciudad: 'Quetzaltenango', jugadores: 22 }
];

export function getEquipos() {
  return equipos;
}

export function buscarEquipo(id) {
  return equipos.find((e) => e.id === id);
}

export function agregarEquipo(nombre, ciudad, jugadores) {
  const nuevo = {
    id: equipos.length + 1,
    nombre: nombre,
    ciudad: ciudad,
    jugadores: jugadores
  };

  equipos.push(nuevo);
  return nuevo;
}
