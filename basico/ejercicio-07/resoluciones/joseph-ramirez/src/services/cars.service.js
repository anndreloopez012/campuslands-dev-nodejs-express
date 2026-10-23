const cars = require("../../data/cars.json");

function getCars() {
  return cars;
}

function findCarsByBrand(brand) {
  const normalizedBrand = brand.trim().toLowerCase();

  return cars.filter(
    (car) => car.marca.toLowerCase() === normalizedBrand
  );
}

module.exports = {
  getCars,
  findCarsByBrand
};