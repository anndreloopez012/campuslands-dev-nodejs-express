// usuarios de prueba, clave en texto plano solo porque es un ejercicio
const usuarios = [
    { id: 1, nombre: "Lucia Mochila", email: "lucia@viajes.com", password: "lucia123", rol: "viajero" },
    { id: 2, nombre: "Pedro Ruta", email: "pedro@viajes.com", password: "pedro123", rol: "viajero" },
    { id: 3, nombre: "Rosa Guia", email: "rosa@viajes.com", password: "rosa123", rol: "guia" },
    { id: 4, nombre: "Javier Guia", email: "javier@viajes.com", password: "javier123", rol: "guia" },
    { id: 5, nombre: "Admin Agencia", email: "admin@viajes.com", password: "admin123", rol: "admin" }
];

// cada tour tiene un guia a cargo (guiaId), precio en quetzales
const tours = [
    { id: 1, nombre: "Volcan Pacaya", destino: "Escuintla", precio: 250, cupos: 10, guiaId: 3 },
    { id: 2, nombre: "Lago de Atitlan", destino: "Solola", precio: 400, cupos: 8, guiaId: 3 },
    { id: 3, nombre: "Tikal al amanecer", destino: "Peten", precio: 900, cupos: 2, guiaId: 4 }
];

const reservas = [
    { id: 1, tourId: 1, viajeroId: 2, personas: 2 },
    { id: 2, tourId: 3, viajeroId: 2, personas: 1 }
];

export { usuarios, tours, reservas };
