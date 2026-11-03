import { characters } from '../data/character.data.js';

export class CharacterService {
  static getAllCharacters() {
    return characters;
  }

  static getCharacterById(id) {
    const character = characters.find(c => c.id === Number(id));
    return character || null;
  }

  static createCharacter(data) {
    const { name, role, level = 1, hp = 100, mana = 50 } = data;

    // Validación de negocio
    if (!name || !role) {
      throw new Error("El nombre y el rol del personaje son obligatorios");
    }

    const validRoles = ["Guerrero", "Maga", "Pícaro", "Clérigo", "Arquero"];
    if (!validRoles.includes(role)) {
      throw new Error(`Rol inválido. Roles permitidos: ${validRoles.join(", ")}`);
    }

    const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
    const newCharacter = {
      id: newId,
      name: name.trim(),
      role,
      level: Number(level),
      hp: Number(hp),
      mana: Number(mana)
    };

    characters.push(newCharacter);
    return newCharacter;
  }
}