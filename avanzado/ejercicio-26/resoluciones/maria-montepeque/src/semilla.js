import { pathToFileURL } from "node:url";
import { crearFabricas } from "./fabricas/index.js";
import { crearTorneo } from "./servicios/torneo.js";

// llena un almacen con datos de desarrollo usando las factories
// con la misma semilla siempre salen los mismos equipos
export function sembrar(almacen, { semilla = 2026, equipos = 6, partidas = 10 } = {}) {
    const f = crearFabricas(almacen, { semilla });
    const torneo = crearTorneo(almacen);

    const lista = Array.from({ length: equipos }, (_, i) => f.equipoCompleto({}, ...(i === 0 ? ["favorito"] : [])));
    for (let i = 0; i < partidas; i++) {
        const a = lista[Math.floor(f.azar() * lista.length)];
        let b = lista[Math.floor(f.azar() * lista.length)];
        if (a.id === b.id) b = lista[(lista.indexOf(a) + 1) % lista.length];
        const estadisticas = [...a.jugadores, ...b.jugadores].map((j) => ({ jugadorId: j.id, kills: Math.floor(f.azar() * 25), muertes: 5 + Math.floor(f.azar() * 15) }));
        torneo.registrarPartida(f.partidaBody({ equipoA: a.id, equipoB: b.id, estadisticas }));
    }
    return { equipos: lista.length, partidas };
}

// si se corre directo (npm run seed) muestra lo que se generaria
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { crearAlmacen } = await import("./datos/almacen.js");
    const almacen = crearAlmacen();
    console.log(sembrar(almacen));
    console.table(crearTorneo(almacen).ranking());
}
