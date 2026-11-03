import { scryptSync, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { ErrorApp } from "../utils/errores.js";

// una clave de "relleno" para gastar el mismo tiempo cuando el usuario no existe
const HASH_FALSO = `${"0".repeat(32)}:${"0".repeat(64)}`;

function claveCorrecta(clave, guardada) {
    const [sal, hash] = guardada.split(":");
    const calculado = scryptSync(String(clave), sal, 32);
    return timingSafeEqual(calculado, Buffer.from(hash, "hex"));
}

export function crearAuthService(store, config) {
    function login({ usuario, clave } = {}) {
        if (typeof usuario !== "string" || typeof clave !== "string") throw new ErrorApp(400, "usuario y clave son obligatorios");
        const encontrado = store.usuarios.find((u) => u.usuario === usuario.trim().toLowerCase());
        // siempre se calcula el hash, exista o no, para no dar pistas por el tiempo
        const ok = claveCorrecta(clave, encontrado?.clave ?? HASH_FALSO) && Boolean(encontrado);
        // mismo mensaje para usuario que no existe y clave mala
        if (!ok) throw new ErrorApp(401, "Usuario o clave incorrectos");

        const token = jwt.sign({ rol: encontrado.rol, nombre: encontrado.nombre }, config.jwtSecreto, { subject: String(encontrado.id), expiresIn: config.jwtExpira, issuer: "taller-motos" });
        return { token, tipo: "Bearer", expiraEn: config.jwtExpira, usuario: { id: encontrado.id, nombre: encontrado.nombre, rol: encontrado.rol } };
    }

    function verificar(token) {
        try {
            const datos = jwt.verify(token, config.jwtSecreto, { issuer: "taller-motos", algorithms: ["HS256"] });
            return { id: Number(datos.sub), rol: datos.rol, nombre: datos.nombre };
        } catch (err) {
            throw new ErrorApp(401, err.name === "TokenExpiredError" ? "El token vencio, inicia sesion otra vez" : "Token invalido");
        }
    }

    return { login, verificar };
}
