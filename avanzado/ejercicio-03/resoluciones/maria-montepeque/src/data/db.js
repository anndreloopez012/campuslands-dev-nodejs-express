const CAMPEONES = [
    { id: 1, nombre: "Garen", rol: "top", dificultad: 1, precio: 450, etiquetas: ["tanque", "facil"] },
    { id: 2, nombre: "Darius", rol: "top", dificultad: 2, precio: 4800, etiquetas: ["luchador"] },
    { id: 3, nombre: "Lee Sin", rol: "jungla", dificultad: 3, precio: 4800, etiquetas: ["asesino", "movilidad"] },
    { id: 4, nombre: "Warwick", rol: "jungla", dificultad: 1, precio: 450, etiquetas: ["luchador"] },
    { id: 5, nombre: "Ahri", rol: "mid", dificultad: 2, precio: 3150, etiquetas: ["mago", "movilidad"] },
    { id: 6, nombre: "Syndra", rol: "mid", dificultad: 3, precio: 6300, etiquetas: ["mago"] },
    { id: 7, nombre: "Jinx", rol: "adc", dificultad: 2, precio: 6300, etiquetas: ["tirador"] },
    { id: 8, nombre: "Ashe", rol: "adc", dificultad: 1, precio: 450, etiquetas: ["tirador", "utilidad"] },
    { id: 9, nombre: "Thresh", rol: "soporte", dificultad: 3, precio: 6300, etiquetas: ["tanque", "utilidad"] },
    { id: 10, nombre: "Lulu", rol: "soporte", dificultad: 2, precio: 4800, etiquetas: ["encantador"] },
    { id: 11, nombre: "Malphite", rol: "top", dificultad: 1, precio: 1350, etiquetas: ["tanque"] },
    { id: 12, nombre: "Caitlyn", rol: "adc", dificultad: 2, precio: 4800, etiquetas: ["tirador"] }
];

const db = { campeones: [], partidas: [] };

function resetDb() {
    db.campeones = structuredClone(CAMPEONES);
    db.partidas = [];
}

resetDb();

export { db, resetDb };
