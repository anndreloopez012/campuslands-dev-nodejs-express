const sneakers = [
  { id: 1, brand: "Nike", model: "Air Zoom Pegasus", price: 120 },
  { id: 2, brand: "Adidas", model: "Ultraboost", price: 180 },
  { id: 3, brand: "New Balance", model: "550", price: 110 },
];

const listSneakers = () => sneakers;
const getSneakerById = (id) => sneakers.find((s) => s.id === Number(id)) || null;

export { listSneakers, getSneakerById };
