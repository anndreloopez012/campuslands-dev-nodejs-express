import { crearEquiposService } from "./equipos.service.js";
import { crearEquiposController } from "./equipos.controller.js";
import { crearEquiposRouter } from "./equipos.routes.js";

export const equiposModulo = {
    nombre: "equipos",
    ruta: "/equipos",
    // el contenedor le pasa el service de jugadores
    necesita: ["jugadores"],
    datosIniciales: [{ id: 1, nombre: "Quetzal Esports", jugadorIds: [1, 2, 4, 6, 3] }],
    crear({ repo, servicios }) {
        const service = crearEquiposService({ repo, jugadores: servicios.jugadores });
        const router = crearEquiposRouter(crearEquiposController(service));
        return { service, router };
    }
};
