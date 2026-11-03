const heroes = [{ id: 1, name: 'Nara', class: 'warrior' }];

export function getHeroes() {
  return heroes;
}

export function addHero(hero) {
  const newHero = { id: heroes.length + 1, ...hero };
  heroes.push(newHero);
  return newHero;
}
