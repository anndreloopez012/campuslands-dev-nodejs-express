import { config } from "../config/index.js";

const { pricing, booking, studio } = config;

const round2 = (value) => Math.round(value * 100) / 100;

const bookings = [{ id: 1, client: "Valeria Ortiz", design: "Colibri acuarela", sizeCm: 12, sessionHours: 3, price: 240, deposit: 72, currency: "USD" }];
let nextId = 2;

const listBookings = () => bookings;
const getBookingById = (id) => bookings.find((b) => b.id === Number(id)) || null;

function createBooking({ client, design, sizeCm, sessionHours }) {
  if (!client || typeof client !== "string" || !client.trim()) throw new Error("client es obligatorio");
  if (!design || typeof design !== "string" || !design.trim()) throw new Error("design es obligatorio");

  const size = Number(sizeCm);
  if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error("sizeCm debe ser un entero entre 1 y 100");

  const hours = Number(sessionHours);
  if (!Number.isFinite(hours) || hours <= 0 || hours > booking.maxSessionHours) throw new Error(`sessionHours debe ser un numero mayor a 0 y hasta ${booking.maxSessionHours}`);

  const price = round2(hours * pricing.hourlyRate);
  const record = { id: nextId++, client: client.trim(), design: design.trim(), sizeCm: size, sessionHours: hours, price, deposit: round2((price * pricing.depositPercent) / 100), currency: studio.currency };
  bookings.push(record);
  return record;
}

export { listBookings, getBookingById, createBooking };
