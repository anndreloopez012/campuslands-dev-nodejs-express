import { crearJugadoresService } from "./jugadores.service.js";
import { crearJugadoresController } from "./jugadores.controller.js";
import { crearJugadoresRouter } from "./jugadores.routes.js";

// la "puerta" del modulo: afuera solo se conoce esto
// datosIniciales: con lo que arranca su repo
export const jugadoresModulo = {
    nombre: "jugadores",
    ruta: "/jugadores",
    necesita: [],
    datosIniciales: [
        { id: 1, gamertag: "Viper", region: "LATAM", elo: 2350 },
        { id: 2, gamertag: "Nova", region: "LATAM", elo: 2100 },
        { id: 3, gamertag: "Ghost", region: "NA", elo: 1980 },
        { id: 4, gamertag: "Blaze", region: "LATAM", elo: 1870 },
        { id: 5, gamertag: "Echo", region: "EU", elo: 2210 },
        { id: 6, gamertag: "Rook", region: "LATAM", elo: 1650 },
        { id: 7, gamertag: "Frost", region: "NA", elo: 2050 },
        { id: 8, gamertag: "Kai", region: "ASIA", elo: 2400 }
    ],
    crear({ repo }) {
        const service = crearJugadoresService({ repo });
        const router = crearJugadoresRouter(crearJugadoresController(service));
        return { service, router };
    }
};
