const tours = [
  { id: 1, name: "Ruta del Cafe", destination: "Salento", price: 320, days: 3 },
  { id: 2, name: "Aventura en la Patagonia", destination: "El Chalten", price: 1450, days: 7 },
];
let nextId = 3;

const listTours = () => tours;
const getTourById = (id) => tours.find((t) => t.id === Number(id)) || null;

function createTour({ name, destination, price, days }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!destination || typeof destination !== "string" || !destination.trim()) throw new Error("destination es obligatorio");

  const numericPrice = Number(price);
  if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) throw new Error("price debe ser un numero mayor a 0");

  const numericDays = Number(days);
  if (!Number.isInteger(numericDays) || numericDays < 1) throw new Error("days debe ser un entero mayor a 0");

  const tour = { id: nextId++, name: name.trim(), destination: destination.trim(), price: numericPrice, days: numericDays };
  tours.push(tour);
  return tour;
}

function deleteTour(id) {
  const index = tours.findIndex((t) => t.id === Number(id));
  return index === -1 ? null : tours.splice(index, 1)[0];
}

export { listTours, getTourById, createTour, deleteTour };
