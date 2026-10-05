const artifacts = [
  { id: 1, name: "Motor Warp", planet: "Vulcano", powerLevel: 95 },
  { id: 2, name: "Sable de Luz", planet: "Ilum", powerLevel: 88 },
  { id: 3, name: "Condensador de Flujo", planet: "Tierra", powerLevel: 92 }
];

export async function getAll() {
  return artifacts;
}

export async function getById(id) {
  const item = artifacts.find(a => a.id === id);
  if (!item) {
    const error = new Error(`Artefacto espacial con ID ${id} no encontrado en el archivo estelar.`);
    error.statusCode = 404;
    throw error;
  }
  return item;
}

export async function create(data) {
  if (!data.name || !data.planet) {
    const error = new Error("Los campos 'name' y 'planet' son obligatorios.");
    error.statusCode = 400;
    throw error;
  }
  const newItem = {
    id: artifacts.length + 1,
    name: data.name,
    planet: data.planet,
    powerLevel: Number(data.powerLevel) || 50
  };
  artifacts.push(newItem);
  return newItem;
}
