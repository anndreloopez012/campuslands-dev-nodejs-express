const hypercars = [
  { id: 1, brand: "Bugatti", model: "Chiron", topSpeed: 420 },
  { id: 2, brand: "Koenigsegg", model: "Jesko", topSpeed: 483 },
];
let nextId = 3;

const listHypercars = () => hypercars;
const getHypercarById = (id) => hypercars.find((h) => h.id === Number(id)) || null;

function createHypercar({ brand, model, topSpeed }) {
  if (!brand || typeof brand !== "string" || !brand.trim()) throw new Error("brand es obligatorio");
  if (!model || typeof model !== "string" || !model.trim()) throw new Error("model es obligatorio");

  const numericTopSpeed = Number(topSpeed);
  if (!topSpeed || Number.isNaN(numericTopSpeed) || numericTopSpeed <= 0) throw new Error("topSpeed debe ser un numero mayor a 0");

  const hypercar = { id: nextId++, brand: brand.trim(), model: model.trim(), topSpeed: numericTopSpeed };
  hypercars.push(hypercar);
  return hypercar;
}

export { listHypercars, getHypercarById, createHypercar };
