import { reservas, tours } from "../data/db.js";
import { tienePermiso } from "../config/permisos.js";
import AppError from "../utils/app-error.js";
import * as toursService from "./tours.service.js";

let nextId = reservas.length + 1;

// cada rol ve una parte distinta de las reservas
function findVisibles(usuario) {
    if (tienePermiso(usuario.rol, "reservas:ver_todas")) {
        return reservas;
    }

    if (tienePermiso(usuario.rol, "reservas:ver_de_mis_tours")) {
        const misTours = tours.filter((t) => t.guiaId === usuario.sub).map((t) => t.id);
        return reservas.filter((r) => misTours.includes(r.tourId));
    }

    return reservas.filter((r) => r.viajeroId === usuario.sub);
}

function create(body, usuario) {
    const { tourId, personas } = body || {};

    if (!Number.isInteger(tourId) || !Number.isInteger(personas) || personas < 1) {
        throw new AppError(400, "tourId y personas deben ser enteros, personas mayor a 0");
    }

    const tour = toursService.findById(tourId);

    if (personas > tour.cupos) {
        throw new AppError(409, `Solo quedan ${tour.cupos} cupos para ${tour.nombre}`);
    }

    // descuento los cupos del tour
    tour.cupos -= personas;

    const nueva = { id: nextId++, tourId, viajeroId: usuario.sub, personas };
    reservas.push(nueva);
    return nueva;
}

function cancelar(id, usuario) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id de la reserva debe ser un numero");
    }

    const reserva = reservas.find((r) => r.id === id);

    if (!reserva) {
        throw new AppError(404, `No existe la reserva con id ${id}`);
    }

    // el viajero solo cancela las suyas, el admin cualquiera
    const puedeTodas = tienePermiso(usuario.rol, "reservas:cancelar_todas");
    if (!puedeTodas && reserva.viajeroId !== usuario.sub) {
        throw new AppError(403, "Solo puedes cancelar tus propias reservas");
    }

    // devuelvo los cupos al tour si todavia existe
    const tour = tours.find((t) => t.id === reserva.tourId);
    if (tour) tour.cupos += reserva.personas;

    reservas.splice(reservas.indexOf(reserva), 1);
}

export { findVisibles, create, cancelar };
