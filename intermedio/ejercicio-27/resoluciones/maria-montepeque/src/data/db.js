// equipos de una liga de MOBA
const EQUIPOS_INICIALES = [
    { id: 1, nombre: "Quetzal Gaming", region: "LATAM", jugadores: ["Kukul", "Tikal", "Jade", "Obsidiana", "Ceiba"] },
    { id: 2, nombre: "Storm Wolves", region: "NA", jugadores: ["Frost", "Howl", "Fang", "Alpha", "Pack"] },
    { id: 3, nombre: "Red Lotus", region: "KR", jugadores: ["Hwan", "Jin", "Seo", "Min", "Joon"] },
    { id: 4, nombre: "Nordic Titans", region: "EU", jugadores: ["Odin", "Loki", "Freya", "Tyr", "Baldr"] }
];

const PARTIDAS_INICIALES = [
    { id: 1, equipoAzulId: 1, equipoRojoId: 2, ganador: "azul", duracionMin: 32 },
    { id: 2, equipoAzulId: 3, equipoRojoId: 1, ganador: "azul", duracionMin: 28 }
];

const equipos = [];
const partidas = [];

function resetDb() {
    equipos.length = 0;
    partidas.length = 0;
    EQUIPOS_INICIALES.forEach((e) => equipos.push({ ...e, jugadores: [...e.jugadores] }));
    PARTIDAS_INICIALES.forEach((p) => partidas.push({ ...p }));
}

resetDb();

export { equipos, partidas, resetDb };
