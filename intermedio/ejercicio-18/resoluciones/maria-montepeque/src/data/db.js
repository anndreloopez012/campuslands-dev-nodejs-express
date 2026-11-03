import bcrypt from "bcryptjs";

// aqui nunca se guarda la password, solo el hash
// los de prueba se hashean al arrancar para no escribir hashes a mano
const paracaidistas = [
    {
        id: 1,
        nombre: "Sara Vuelo",
        email: "sara@salto.com",
        licencia: "B",
        saltos: 120,
        passwordHash: bcrypt.hashSync("caida2024", 10)
    },
    {
        id: 2,
        nombre: "Hugo Viento",
        email: "hugo@salto.com",
        licencia: "A",
        saltos: 25,
        passwordHash: bcrypt.hashSync("nube12345", 10)
    }
];

export { paracaidistas };
