const personajes = [
  { id: 1, nombre: 'Aragorn', clase: 'guerrero', nivel: 45 },
  { id: 2, nombre: 'Gandalf', clase: 'mago', nivel: 90 },
  { id: 3, nombre: 'Legolas', clase: 'arquero', nivel: 60 }
];

export function getPersonajes() {
  return personajes;
}

export function buscarPersonaje(id) {
  return personajes.find((p) => p.id === id);
}

export function agregarPersonaje(nombre, clase, nivel) {
  const nuevo = {
    id: personajes.length + 1,
    nombre: nombre,
    clase: clase,
    nivel: nivel
  };

  personajes.push(nuevo);
  return nuevo;
}
