import bcrypt from "bcryptjs";

// usuarios de prueba: las claves se hashean una vez al arrancar
// en el codigo nunca se guarda la clave en texto plano dentro de los usuarios
const USUARIOS_INICIALES = [
    { id: 1, nombre: "Ana Recepcion", email: "ana@taller.com", clave: "recepcion123", rol: "recepcion" },
    { id: 2, nombre: "Beto Mecanico", email: "beto@taller.com", clave: "mecanico123", rol: "mecanico" },
    { id: 3, nombre: "Carla Mecanica", email: "carla@taller.com", clave: "mecanico456", rol: "mecanico" },
    { id: 4, nombre: "Diego Admin", email: "admin@taller.com", clave: "admin12345", rol: "admin" }
].map(({ clave, ...usuario }) => ({ ...usuario, passwordHash: bcrypt.hashSync(clave, 10) }));

const MOTOS_INICIALES = [
    { id: 1, placa: "M123ABC", marca: "Honda", modelo: "CB190R", anio: 2021, cilindraje: 190, km: 18500, propietario: { nombre: "Luis Perez", telefono: "55551234" } },
    { id: 2, placa: "M456DEF", marca: "Yamaha", modelo: "FZ 2.0", anio: 2019, cilindraje: 150, km: 42000, propietario: { nombre: "Maria Lopez", telefono: "44443333" } },
    { id: 3, placa: "M789GHI", marca: "Suzuki", modelo: "Gixxer", anio: 2023, cilindraje: 155, km: 6200, propietario: { nombre: "Jorge Cruz", telefono: "33332222" } },
    { id: 4, placa: "M321JKL", marca: "Honda", modelo: "XR150L", anio: 2018, cilindraje: 150, km: 55300, propietario: { nombre: "Sofia Ramos", telefono: "22221111" } },
    { id: 5, placa: "M654MNO", marca: "Bajaj", modelo: "Pulsar NS200", anio: 2022, cilindraje: 200, km: 15800, propietario: { nombre: "Pedro Gomez", telefono: "77778888" } },
    { id: 6, placa: "M987PQR", marca: "Kawasaki", modelo: "Ninja 400", anio: 2020, cilindraje: 400, km: 23100, propietario: { nombre: "Lucia Diaz", telefono: "66665555" } }
];

// precio en quetzales
const REPUESTOS_INICIALES = [
    { id: 1, nombre: "Aceite 20W50 (1 litro)", precio: 65, stock: 20 },
    { id: 2, nombre: "Filtro de aceite", precio: 45, stock: 10 },
    { id: 3, nombre: "Pastillas de freno", precio: 120, stock: 4 },
    { id: 4, nombre: "Kit de arrastre", precio: 550, stock: 2 },
    { id: 5, nombre: "Bujia", precio: 35, stock: 0 }
];

const ORDENES_INICIALES = [
    {
        id: 1,
        motoId: 2,
        tipo: "mantenimiento",
        descripcion: "Servicio de los 40,000 km",
        estado: "pendiente",
        mecanicoId: null,
        repuestos: [],
        historial: [{ estado: "pendiente", por: 1, fecha: "2026-11-01T09:00:00.000Z" }],
        creada: "2026-11-01T09:00:00.000Z"
    }
];

const db = {
    usuarios: [],
    motos: [],
    repuestos: [],
    ordenes: [],
    // email => { fallidos, desde }
    intentosLogin: new Map()
};

// copia profunda para que los cambios no toquen los datos iniciales
function resetDb() {
    db.usuarios = structuredClone(USUARIOS_INICIALES);
    db.motos = structuredClone(MOTOS_INICIALES);
    db.repuestos = structuredClone(REPUESTOS_INICIALES);
    db.ordenes = structuredClone(ORDENES_INICIALES);
    db.intentosLogin.clear();
}

// siguiente id de una lista
function siguienteId(lista) {
    return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

resetDb();

export { db, resetDb, siguienteId };
