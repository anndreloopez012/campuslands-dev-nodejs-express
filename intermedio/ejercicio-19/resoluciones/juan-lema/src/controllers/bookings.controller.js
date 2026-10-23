import { listBookings, getBookingById, createBooking } from "../services/bookings.service.js";

const getBookings = (req, res) => res.json({ ok: true, data: listBookings() });

function getBooking(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const booking = getBookingById(id);
  if (!booking) return res.status(404).json({ ok: false, message: `Cita con id ${id} no encontrada` });

  res.json({ ok: true, data: booking });
}

function postBooking(req, res) {
  try {
    res.status(201).json({ ok: true, data: createBooking(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getBookings, getBooking, postBooking };
