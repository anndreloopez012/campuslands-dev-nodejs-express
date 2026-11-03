import { Partida } from "../dominio/partida.js";

// items que aparecen en el suelo al empezar
const ITEMS = [
    { id: 1, tipo: "arma", nombre: "Rifle de asalto", dano: 35 },
    { id: 2, tipo: "arma", nombre: "Escopeta", dano: 60 },
    { id: 3, tipo: "municion", nombre: "Caja de balas", cantidad: 10 },
    { id: 4, tipo: "municion", nombre: "Cartuchos", cantidad: 4 },
    { id: 5, tipo: "botiquin", nombre: "Botiquin", cura: 40 },
    { id: 6, tipo: "botiquin", nombre: "Venda", cura: 15 },
    { id: 7, tipo: "escudo", nombre: "Mini escudo", puntos: 25 },
    { id: 8, tipo: "escudo", nombre: "Escudo grande", puntos: 50 },
    { id: 9, tipo: "botiquin", nombre: "Venda", cura: 15 },
    { id: 10, tipo: "botiquin", nombre: "Venda", cura: 15 },
    { id: 11, tipo: "botiquin", nombre: "Venda", cura: 15 }
];

const db = { partidas: new Map() };

function resetDb() {
    db.partidas.clear();
    db.partidas.set(1, new Partida({ id: 1, mapa: "Isla Calavera", jugadores: ["Raven", "Wolf", "Ghost"], items: ITEMS }));
    db.partidas.set(2, new Partida({ id: 2, mapa: "Desierto Rojo", estado: "lobby", jugadores: ["Hawk", "Fang"], items: ITEMS }));
}

resetDb();

export { db, resetDb };
