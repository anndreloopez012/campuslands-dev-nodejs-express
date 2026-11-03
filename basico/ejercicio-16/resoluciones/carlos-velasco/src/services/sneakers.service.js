const sneakers = [
  {
    id: 1,
    name: 'Air Max 95',
    brand: 'Nike',
    category: 'sneakers',
    price: 180
  },
  {
    id: 2,
    name: 'Forum Low',
    brand: 'Adidas',
    category: 'sneakers',
    price: 120
  },
  {
    id: 3,
    name: '574 Core',
    brand: 'New Balance',
    category: 'sneakers',
    price: 100
  }
];

const getSneakers = () => {
  return sneakers;
};

const getSneakerById = (id) => {
  return sneakers.find((sneaker) => sneaker.id === id);
};

module.exports = {
  getSneakers,
  getSneakerById
};