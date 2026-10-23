const hypercarEmitter = require('../events/hypercar.events');

const createHypercar = ({ brand, model, year }) => {
  if (!brand || !model || !year) {
    const error = new Error(
      'brand, model y year son campos obligatorios.'
    );

    error.statusCode = 400;

    throw error;
  }

  const numericYear = Number(year);

  if (!Number.isInteger(numericYear) || numericYear < 1900) {
    const error = new Error(
      'year debe ser un numero entero valido.'
    );

    error.statusCode = 400;

    throw error;
  }

  const hypercar = {
    id: Date.now(),
    brand,
    model,
    year: numericYear
  };

  hypercarEmitter.emit('hypercar.created', hypercar);

  return hypercar;
};

module.exports = {
  createHypercar
};