import { Router } from "express";
import { getBookings, getBooking, postBooking } from "../controllers/bookings.controller.js";
import { requireApiKey } from "../middlewares/require-api-key.js";

const router = Router();

router.post("/", postBooking);
router.get("/", requireApiKey, getBookings);
router.get("/:id", requireApiKey, getBooking);

export default router;
