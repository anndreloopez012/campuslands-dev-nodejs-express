import { addHero, getHeroes } from '../services/heroesService.js';

export function listHeroes(_request, response) {
  response.json({ data: getHeroes() });
}

export function createHero(request, response) {
  const { name, class: heroClass } = request.body;
  if (typeof name !== 'string' || !name.trim() || typeof heroClass !== 'string' || !heroClass.trim()) {
    return response.status(400).json({ error: 'El nombre y la clase son obligatorios.' });
  }

  const hero = addHero({ name: name.trim(), class: heroClass.trim() });
  return response.status(201).json({ data: hero });
}
