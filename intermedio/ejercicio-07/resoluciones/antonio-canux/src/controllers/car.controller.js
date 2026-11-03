import { cars } from '../data/car.data.js';
import { AppError } from '../utils/app-error.js';

export const listCars = (req, res) => {
  res.status(200).json({ ok: true, total: cars.length, data: cars });
};

export const getCarById = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return next(new AppError("El id debe ser un entero positivo", 400));
  }

  const car = cars.find((c) => c.id === id);
  if (!car) {
    return next(new AppError(`Auto con id ${id} no encontrado`, 404));
  }

  res.status(200).json({ ok: true, data: car });
};

export const createCar = (req, res, next) => {
  const { brand, model, year, priceUsd } = req.body || {};

  if (!brand || !model || !Number.isInteger(year) || typeof priceUsd !== 'number') {
    return next(new AppError("Se requieren brand, model, year (entero) y priceUsd (número)", 400));
  }

  if (cars.some((c) => c.brand === brand && c.model === model && c.year === year)) {
    return next(new AppError("El auto ya está registrado", 409));
  }

  const car = { id: Math.max(0, ...cars.map((c) => c.id)) + 1, brand, model, year, priceUsd };
  cars.push(car);

  res.status(201).json({ ok: true, message: "Auto registrado con éxito", data: car });
};

// Ruta de prueba: lanza un error inesperado para ver el manejo de errores 500
export const crash = () => {
  throw new Error("Fallo inesperado simulado");
};
