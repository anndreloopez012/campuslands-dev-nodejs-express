import TABLA_PERIODICA from "./data/tabla-periodica.js";
import { crearRepositorioEnMemoria } from "./repositories/compuestos.repository.js";
import { crearCompuestosService } from "./services/compuestos.service.js";

// aqui armo las piezas de verdad: repo en memoria + tabla real + reloj real
// en los tests no uso este archivo, armo el service con piezas falsas
const repo = crearRepositorioEnMemoria([
    { id: 1, nombre: "Agua", formula: "H2O", masaMolar: 18.015, registrado: "2026-11-01T10:00:00.000Z" }
]);

const compuestosService = crearCompuestosService({ repo, tablaPeriodica: TABLA_PERIODICA });

export { compuestosService, TABLA_PERIODICA };
