// usuarios de prueba, la clave va en texto plano porque es simulado
// en un proyecto real se guarda un hash (bcrypt por ejemplo)
const usuarios = [
    { id: 1, nombre: "Ana Lectora", email: "ana@libros.com", password: "ana123", rol: "lector" },
    { id: 2, nombre: "Bruno Admin", email: "admin@libros.com", password: "admin123", rol: "admin" }
];

const libros = [
    { id: 1, titulo: "Cien anos de soledad", autor: "Gabriel Garcia Marquez", anio: 1967, creadoPor: 2 },
    { id: 2, titulo: "Ficciones", autor: "Jorge Luis Borges", anio: 1944, creadoPor: 2 },
    { id: 3, titulo: "Hombres de maiz", autor: "Miguel Angel Asturias", anio: 1949, creadoPor: 2 }
];

// tokens activos: token => id del usuario
const sesiones = new Map();

export { usuarios, libros, sesiones };
