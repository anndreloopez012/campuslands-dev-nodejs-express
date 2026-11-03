// datos iniciales, los guardo aparte para poder reiniciar en los tests
const TRABAJOS_INICIALES = [
    { id: 1, cliente: "Taller Lopez", proceso: "MIG", material: "acero", metros: 4, costo: 240, estado: "terminado" },
    { id: 2, cliente: "Herreria El Yunque", proceso: "TIG", material: "inoxidable", metros: 2, costo: 300, estado: "pendiente" }
];

const trabajos = [];
let nextId = 1;

// deja los trabajos como al inicio
function resetDb() {
    trabajos.length = 0;
    TRABAJOS_INICIALES.forEach((t) => trabajos.push({ ...t }));
    nextId = trabajos.length + 1;
}

function siguienteId() {
    return nextId++;
}

resetDb();

export { trabajos, resetDb, siguienteId };
