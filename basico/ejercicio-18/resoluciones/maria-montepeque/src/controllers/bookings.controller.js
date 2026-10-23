import { json } from "../core/response.js";
import { parseJsonBody } from "../core/body.js";
import { listBookings, createBooking, confirmBooking } from "../services/bookings.service.js";

function getBookings(req, res) {
    const data = listBookings();
    json(res, 200, { ok: true, count: data.length, data });
}

async function postBooking(req, res) {
    const body = await parseJsonBody(req);
    const { errors, booking } = createBooking(body);

    if (errors) return json(res, 400, { ok: false, message: "Reserva invalida", errors });

    json(res, 201, { ok: true, data: booking }, { Location: `/bookings/${booking.id}` });
}

function postConfirm(req, res) {
    const { id } = req.params;
    const { notFound, conflict, booking } = confirmBooking(id);

    if (notFound) return json(res, 404, { ok: false, message: `No existe la reserva ${id}` });
    if (conflict) return json(res, 409, { ok: false, message: `La reserva ${id} ya estaba confirmada` });

    json(res, 200, { ok: true, data: booking });
}

export { getBookings, postBooking, postConfirm };