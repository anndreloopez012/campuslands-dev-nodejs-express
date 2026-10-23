import { listTours, getTourById, createTour, deleteTour } from "../services/tours.service.js";

const getTours = (req, res) => res.json({ ok: true, data: listTours() });

function getTour(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const tour = getTourById(id);
  if (!tour) return res.status(404).json({ ok: false, message: `Tour con id ${id} no encontrado` });

  res.json({ ok: true, data: tour });
}

function postTour(req, res) {
  try {
    res.status(201).json({ ok: true, createdBy: req.user.username, data: createTour(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

function removeTour(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const tour = deleteTour(id);
  if (!tour) return res.status(404).json({ ok: false, message: `Tour con id ${id} no encontrado` });

  res.json({ ok: true, data: tour });
}

export { getTours, getTour, postTour, removeTour };
