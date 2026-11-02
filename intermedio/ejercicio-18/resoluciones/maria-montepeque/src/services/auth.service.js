import { paracaidistas } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { exigirFuerza, hashPassword, compararPassword } from "../utils/password.js";

let nextId = paracaidistas.length + 1;

const LICENCIAS = ["A", "B", "C", "D"];

// nunca devuelvo el hash al cliente
function publico(usuario) {
    const { passwordHash, ...resto } = usuario;
    return resto;
}

async function registro(body) {
    const { nombre, email, password, licencia } = body || {};
    const errors = [];

    if (typeof nombre !== "string" || nombre.trim() === "") errors.push("nombre es obligatorio");
    if (typeof email !== "string" || !email.includes("@")) errors.push("email no es valido");
    if (licencia !== undefined && !LICENCIAS.includes(licencia)) {
        errors.push(`licencia debe ser una de: ${LICENCIAS.join(", ")}`);
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    exigirFuerza(password);

    const emailLimpio = email.trim().toLowerCase();
    if (paracaidistas.some((p) => p.email === emailLimpio)) {
        throw new AppError(409, "Ya existe una cuenta con ese email");
    }

    const nuevo = {
        id: nextId++,
        nombre: nombre.trim(),
        email: emailLimpio,
        licencia: licencia || "A",
        saltos: 0,
        passwordHash: await hashPassword(password)
    };

    paracaidistas.push(nuevo);
    return publico(nuevo);
}

async function login(body) {
    const { email, password } = body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        throw new AppError(400, "email y password son obligatorios");
    }

    const usuario = paracaidistas.find((p) => p.email === email.trim().toLowerCase());

    // comparo contra el hash, la password original no se puede sacar
    const coincide = usuario ? await compararPassword(password, usuario.passwordHash) : false;

    if (!coincide) {
        throw new AppError(401, "Credenciales incorrectas");
    }

    return publico(usuario);
}

async function cambiarPassword(body) {
    const { email, actual, nueva } = body || {};

    if (typeof actual !== "string" || typeof nueva !== "string") {
        throw new AppError(400, "actual y nueva son obligatorias");
    }

    // reuso el login para revisar la password actual
    await login({ email, password: actual });

    if (actual === nueva) {
        throw new AppError(400, "La nueva password tiene que ser distinta a la actual");
    }

    exigirFuerza(nueva);

    const usuario = paracaidistas.find((p) => p.email === email.trim().toLowerCase());
    usuario.passwordHash = await hashPassword(nueva);
}

function listar() {
    return paracaidistas.map(publico);
}

export { registro, login, cambiarPassword, listar };
