import { getBookings, postBooking, postConfirm } from "../controllers/bookings.controller.js";

function bookingsRoutes(router) {
    router.get("/bookings", getBookings);
    router.post("/bookings", postBooking);
    router.post("/bookings/:id/confirm", postConfirm);
}

export { bookingsRoutes };