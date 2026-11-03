const JUMP_TYPES = ["tandem", "solo"];
const LICENSES = ["A", "B", "C", "D"];
const MAX_WEIGHT_KG = 110;

const bookings = [];
let nextId = 1;

function validateBooking({ jumper, weightKg, jumpType, license }) {
    const errors = {};

    if (!jumper || typeof jumper !== "string" || !jumper.trim()) {
        errors.jumper = "es obligatorio";
    }

    if (typeof weightKg !== "number" || weightKg <= 0) {
        errors.weightKg = "debe ser un numero mayor a 0";
    } else if (weightKg > MAX_WEIGHT_KG) {
        errors.weightKg = `no puede superar ${MAX_WEIGHT_KG} kg`;
    }

    if (!JUMP_TYPES.includes(jumpType)) {
        errors.jumpType = `debe ser uno de: ${JUMP_TYPES.join(", ")}`;
    } else if (jumpType === "solo" && !LICENSES.includes(license)) {
        errors.license = `un salto solo requiere licencia ${LICENSES.join(", ")}`;
    }

    return errors;
}

function listBookings() {
    return bookings;
}

function createBooking(payload) {
    const errors = validateBooking(payload);
    if (Object.keys(errors).length > 0) return { errors };

    const booking = {
        id: nextId++,
        jumper: payload.jumper.trim(),
        weightKg: payload.weightKg,
        jumpType: payload.jumpType,
        license: payload.jumpType === "solo" ? payload.license : null,
        altitudeFt: payload.jumpType === "tandem" ? 10000 : 13000,
        status: "pending",
    };

    bookings.push(booking);
    return { booking };
}

function confirmBooking(id) {
    const booking = bookings.find((item) => item.id === Number(id));
    if (!booking) return { notFound: true };
    if (booking.status === "confirmed") return { conflict: true, booking };

    booking.status = "confirmed";
    booking.confirmedAt = new Date().toISOString();
    return { booking };
}

export { listBookings, createBooking, confirmBooking };