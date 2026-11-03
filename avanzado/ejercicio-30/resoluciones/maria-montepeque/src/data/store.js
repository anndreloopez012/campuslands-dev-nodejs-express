import { randomBytes, scryptSync } from "node:crypto";

// la "base de datos" en memoria del taller de motos
// los precios van en CENTAVOS (enteros) para no tener errores de decimales

export function hashClave(clave, sal = randomBytes(16).toString("hex")) {
    return `${sal}:${scryptSync(clave, sal, 32).toString("hex")}`;
}

export function crearStore() {
    return {
        usuarios: [
            { id: 1, usuario: "rosa", nombre: "Rosa Pineda", rol: "recepcion", clave: hashClave("recepcion123") },
            { id: 2, usuario: "beto", nombre: "Beto Cifuentes", rol: "mecanico", clave: hashClave("mecanico123") },
            { id: 3, usuario: "ana", nombre: "Ana Lopez", rol: "admin", clave: hashClave("admin12345") }
        ],
        clientes: [
            { id: 1, nombre: "Carlos Mendez", telefono: "5555-1234" },
            { id: 2, nombre: "Lucia Herrera", telefono: "4444-9876" }
        ],
        motos: [
            { id: 1, clienteId: 1, marca: "Honda", modelo: "CB190R", anio: 2021, placa: "M123ABC", cilindraje: 184 },
            { id: 2, clienteId: 2, marca: "Yamaha", modelo: "FZ 2.0", anio: 2019, placa: "M456DEF", cilindraje: 149 },
            { id: 3, clienteId: 1, marca: "Suzuki", modelo: "GN125", anio: 2016, placa: "M789GHI", cilindraje: 124 }
        ],
        repuestos: [
            { id: 1, nombre: "Kit de arrastre", stock: 4, reservado: 0, precio: 45000, minimo: 2 },
            { id: 2, nombre: "Pastillas de freno", stock: 10, reservado: 0, precio: 12000, minimo: 4 },
            { id: 3, nombre: "Aceite 20W50 (litro)", stock: 30, reservado: 0, precio: 6500, minimo: 10 },
            { id: 4, nombre: "Bujia NGK", stock: 3, reservado: 0, precio: 3500, minimo: 5 },
            { id: 5, nombre: "Filtro de aire", stock: 1, reservado: 0, precio: 9000, minimo: 2 }
        ],
        ordenes: [],
        auditoria: [],
        pagos: new Map(), // Idempotency-Key -> respuesta
        siguiente: { motos: 4, ordenes: 1 }
    };
}
