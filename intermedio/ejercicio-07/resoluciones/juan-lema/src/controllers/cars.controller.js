import { listCars, getCarById, createCar } from "../services/cars.service.js";

const getCars = (req, res) => res.json({ ok: true, data: listCars() });

function getCar(req, res, next) {
  try {
    res.json({ ok: true, data: getCarById(req.params.id) });
  } catch (error) {
    next(error);
  }
}

function postCar(req, res, next) {
  try {
    res.status(201).json({ ok: true, data: createCar(req.body || {}) });
  } catch (error) {
    next(error);
  }
}

export { getCars, getCar, postCar };
