import { calcularAtributos } from '../../domain/atributos.js';

export const presentarV1 = (personaje) => ({
  id: personaje.id,
  nombre: personaje.nombre,
  clase: personaje.clase,
  nivel: personaje.nivel,
  hp: calcularAtributos(personaje.clase, personaje.nivel).vida,
});
