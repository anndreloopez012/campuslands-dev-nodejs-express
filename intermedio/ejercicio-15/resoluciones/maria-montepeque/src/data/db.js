// usuarios de prueba, clave en texto plano solo porque es un ejercicio
const usuarios = [
    { id: 1, nombre: "Carlos Puesto", email: "carlos@comida.com", password: "carlos123" },
    { id: 2, nombre: "Valeria Antojo", email: "valeria@comida.com", password: "valeria123" }
];

// menu del puesto, precio en quetzales
const platos = [
    { id: 1, nombre: "Shuco de longaniza", precio: 15 },
    { id: 2, nombre: "Tacos al pastor", precio: 20 },
    { id: 3, nombre: "Elote loco", precio: 12 },
    { id: 4, nombre: "Papas fritas", precio: 10 }
];

// cada pedido guarda el id del usuario que lo hizo
const pedidos = [
    { id: 1, usuarioId: 2, platoId: 2, cantidad: 3, total: 60 }
];

export { usuarios, platos, pedidos };
