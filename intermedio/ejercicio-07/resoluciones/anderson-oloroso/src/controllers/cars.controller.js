import * as carsService from '../services/cars.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware de errores'
  });
};

export const listCars = (req, res, next) => {
  try {
    const cars = carsService.getAllCars();
    return res.status(200).json({
      ok: true,
      total: cars.length,
      data: cars
    });
  } catch (error) {
    next(error);
  }
};

export const getCar = (req, res, next) => {
  try {
    const { id } = req.params;
    const car = carsService.getCarById(id);
    return res.status(200).json({
      ok: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

export const postTestDrive = (req, res, next) => {
  try {
    const booking = carsService.bookTestDrive(req.body);
    return res.status(201).json({
      ok: true,
      message: 'Reserva de Test Drive procesada exitosamente',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
