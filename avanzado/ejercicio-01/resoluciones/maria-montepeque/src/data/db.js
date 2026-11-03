// los datos se guardan con el modelo "interno" (dominio)
// cada version de la API decide como mostrarlos
const PERSONAJES_INICIALES = [
    { id: 1, nombre: "Aldric", clase: "guerrero", nivel: 12, vida: 340, mana: 40, fuerza: 28, inventario: ["espada larga", "escudo"] },
    { id: 2, nombre: "Lyra", clase: "maga", nivel: 9, vida: 150, mana: 220, fuerza: 8, inventario: ["baston", "pocion de mana"] },
    { id: 3, nombre: "Fenn", clase: "arquero", nivel: 15, vida: 260, mana: 80, fuerza: 18, inventario: ["arco largo"] },
    { id: 4, nombre: "Mirella", clase: "clerigo", nivel: 7, vida: 180, mana: 160, fuerza: 10, inventario: [] },
    { id: 5, nombre: "Brom", clase: "guerrero", nivel: 3, vida: 160, mana: 20, fuerza: 15, inventario: ["hacha"] }
];

const db = { personajes: [] };

function resetDb() {
    db.personajes = structuredClone(PERSONAJES_INICIALES);
}

resetDb();

export { db, resetDb };
