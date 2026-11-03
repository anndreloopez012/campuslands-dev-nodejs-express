// usuarios de prueba, clave en texto plano solo porque es un ejercicio
const usuarios = [
    { id: 1, nombre: "Diana Street", email: "diana@sneakers.com", password: "diana123", rol: "cliente" },
    { id: 2, nombre: "Marco Hype", email: "marco@sneakers.com", password: "marco123", rol: "cliente" },
    { id: 3, nombre: "Admin Tienda", email: "admin@sneakers.com", password: "admin123", rol: "admin" }
];

// precio en quetzales
const sneakers = [
    { id: 1, modelo: "Air Max 90", marca: "Nike", talla: 40, precio: 1200, stock: 5 },
    { id: 2, modelo: "Forum Low", marca: "Adidas", talla: 42, precio: 950, stock: 2 },
    { id: 3, modelo: "Old Skool", marca: "Vans", talla: 38, precio: 600, stock: 0 }
];

// un carrito por usuario: usuarioId => lista de items
const carritos = new Map([
    [2, [{ sneakerId: 1, cantidad: 1 }]]
]);

export { usuarios, sneakers, carritos };
