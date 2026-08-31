const CLASSES = ["Guerrero", "Mago", "Arquero", "Clerigo"];

function createCharacter(name) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("El nombre del personaje es obligatorio");
  }

  const level = Math.floor(Math.random() * 10) + 1;
  const characterClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];

  return {
    name: name.trim(),
    class: characterClass,
    level,
    hp: level * 12,
    mp: level * 6,
  };
}

export { createCharacter };
