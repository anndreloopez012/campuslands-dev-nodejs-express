import { crearTorneosService } from "./torneos.service.js";
import { crearTorneosController } from "./torneos.controller.js";
import { crearTorneosRouter } from "./torneos.routes.js";

export const torneosModulo = {
    nombre: "torneos",
    ruta: "/torneos",
    necesita: ["equipos"],
    datosIniciales: [{ id: 1, nombre: "Copa Centroamerica", cupo: 8, eloMinimo: 1800, equipoIds: [] }],
    crear({ repo, servicios }) {
        const service = crearTorneosService({ repo, equipos: servicios.equipos });
        const router = crearTorneosRouter(crearTorneosController(service));
        return { service, router };
    }
};
