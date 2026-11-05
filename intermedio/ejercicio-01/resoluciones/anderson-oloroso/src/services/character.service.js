import { characters } from '../data/character.data.js';

let characterList = [...characters];

function calcularPoderCombate(clase, nivel, fuerza, agilidad, inteligencia) {
  let bono = 0;
  switch (clase.toLowerCase()) {
    case 'guerrero':
      bono = fuerza * 2.5 + agilidad * 0.8 + inteligencia * 0.2;
      break;
    case 'mago':
      bono = inteligencia * 3.0 + agilidad * 0.5 + fuerza * 0.2;
      break;
    case 'arquero':
      bono = agilidad * 2.8 + fuerza * 0.9 + inteligencia * 0.4;
      break;
    case 'clerigo':
      bono = inteligencia * 2.0 + fuerza * 1.5 + agilidad * 0.5;
      break;
    default:
      bono = fuerza + agilidad + inteligencia;
  }
  return Math.round(bono + nivel * 5);
}

export const getAllCharacters = () => {
  return characterList;
};

export const getCharacterById = (id) => {
  const parsedId = Number(id);
  const found = characterList.find((c) => c.id === parsedId);
  if (!found) {
    const error = new Error(`Personaje con ID ${id} no encontrado en el reino.`);
    error.statusCode = 404;
    throw error;
  }
  return found;
};

export const createCharacter = ({ nombre, clase, nivel = 1, fuerza = 10, agilidad = 10, inteligencia = 10 }) => {
  const clasesPermitidas = ['guerrero', 'mago', 'arquero', 'clerigo'];
  if (!clasesPermitidas.includes(clase.toLowerCase())) {
    const error = new Error(`Clase inválida. Las clases permitidas son: Guerrero, Mago, Arquero, Clerigo.`);
    error.statusCode = 400;
    throw error;
  }

  const nuevoId = characterList.length > 0 ? Math.max(...characterList.map((c) => c.id)) + 1 : 1;
  const hpBase = clase.toLowerCase() === 'guerrero' ? 300 : clase.toLowerCase() === 'clerigo' ? 250 : 200;
  const mpBase = clase.toLowerCase() === 'mago' ? 400 : clase.toLowerCase() === 'clerigo' ? 300 : 100;

  const hp = hpBase + nivel * 20 + fuerza * 5;
  const mp = mpBase + nivel * 15 + inteligencia * 8;
  const poderCombate = calcularPoderCombate(clase, nivel, fuerza, agilidad, inteligencia);

  const nuevoPersonaje = {
    id: nuevoId,
    nombre: nombre.trim(),
    clase: clase.charAt(0).toUpperCase() + clase.slice(1).toLowerCase(),
    nivel,
    hp,
    mp,
    fuerza,
    agilidad,
    inteligencia,
    poderCombate
  };

  characterList.push(nuevoPersonaje);
  return nuevoPersonaje;
};
