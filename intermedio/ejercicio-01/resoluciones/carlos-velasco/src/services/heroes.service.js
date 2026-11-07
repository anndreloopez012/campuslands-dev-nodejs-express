const heroes = [
  { id: 1, name: 'Aldric', clase: 'guerrero', nivel: 12, hp: 260 },
  { id: 2, name: 'Nym', clase: 'mago', nivel: 10, hp: 180 },
  { id: 3, name: 'Kaela', clase: 'arquera', nivel: 15, hp: 210 }
];

const claseValidas = ['guerrero', 'mago', 'arquera', 'clerigo'];

function listarHeroes() {
  return heroes;
}

function obtenerHeroe(id) {
  return heroes.find((heroe) => heroe.id === id) || null;
}

function crearHeroe(datos) {
  const { name, clase, nivel, hp } = datos;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw new Error('El campo "name" es obligatorio y debe tener al menos 3 caracteres');
  }
  if (!claseValidas.includes(clase)) {
    throw new Error(`La clase "${clase}" no es valida. Clases disponibles: ${claseValidas.join(', ')}`);
  }
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 100) {
    throw new Error('El campo "nivel" debe ser un entero entre 1 y 100');
  }
  if (!Number.isInteger(hp) || hp <= 0) {
    throw new Error('El campo "hp" debe ser un entero mayor a 0');
  }

  const nuevoHeroe = {
    id: heroes.length + 1,
    name: name.trim(),
    clase,
    nivel,
    hp
  };

  heroes.push(nuevoHeroe);
  return nuevoHeroe;
}

function eliminarHeroe(id) {
  const indice = heroes.findIndex((heroe) => heroe.id === id);
  if (indice === -1) return false;
  heroes.splice(indice, 1);
  return true;
}

module.exports = { listarHeroes, obtenerHeroe, crearHeroe, eliminarHeroe };
