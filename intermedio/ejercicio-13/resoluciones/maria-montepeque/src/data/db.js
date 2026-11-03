// una nave tiene muchos tripulantes
// cada tripulante apunta a su nave con naveId
const naves = [
    { id: 1, nombre: "Odisea", clase: "Exploracion" },
    { id: 2, nombre: "Halcon Estelar", clase: "Carga" },
    { id: 3, nombre: "Aurora", clase: "Investigacion" }
];

const tripulantes = [
    { id: 1, nombre: "Elena Vasquez", rol: "Capitana", naveId: 1 },
    { id: 2, nombre: "Tomas Rek", rol: "Piloto", naveId: 1 },
    { id: 3, nombre: "Yara Sol", rol: "Ingeniera", naveId: 2 },
    { id: 4, nombre: "Unidad K-9", rol: "Androide", naveId: 1 }
];

export { naves, tripulantes };
