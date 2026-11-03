import { randomBytes, createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

// dos tokens:
//   access token:  JWT corto (15 min). Va en cada peticion. Si lo roban, sirve poco tiempo
//   refresh token: texto al azar largo (7 dias). Solo sirve para pedir un access nuevo
//
// el refresh se guarda HASHEADO (sha256): si se filtra la base de datos no sirven
// cada vez que se usa se cambia por otro (rotacion)
// todos los refresh de un mismo login forman una "familia"
// si alguien usa uno que YA se uso, alguien lo robo: se revoca toda la familia

const hash = (texto) => createHash("sha256").update(texto).digest("hex");

export class ErrorAuth extends Error {
    constructor(code, mensaje, status = 401) {
        super(mensaje);
        this.code = code;
        this.status = status;
    }
}

export function crearTokens({ secreto, accessSegundos = 15 * 60, refreshSegundos = 7 * 24 * 3600 }) {
    // hash del refresh -> datos del token
    const refreshs = new Map();
    // familia -> datos de la sesion
    const familias = new Map();
    const registro = []; // eventos de seguridad (para ver que paso)

    function firmarAccess(usuario, familiaId) {
        return jwt.sign({ sub: usuario.id, nombre: usuario.nombre, fam: familiaId }, secreto, { expiresIn: accessSegundos });
    }

    function nuevoRefresh(usuarioId, familiaId) {
        const token = randomBytes(32).toString("base64url");
        refreshs.set(hash(token), { usuarioId, familiaId, venceEn: Date.now() + refreshSegundos * 1000, usado: false });
        return token;
    }

    // al hacer login empieza una familia nueva
    function iniciarSesion(usuario, { dispositivo = "desconocido" } = {}) {
        const familiaId = randomUUID();
        familias.set(familiaId, { usuarioId: usuario.id, dispositivo, creada: Date.now(), ultimoUso: Date.now(), revocada: false });
        return { access: firmarAccess(usuario, familiaId), refresh: nuevoRefresh(usuario.id, familiaId), familiaId };
    }

    // cambia un refresh por un par nuevo
    function rotar(refresh, buscarUsuario) {
        const datos = refresh ? refreshs.get(hash(refresh)) : undefined;
        if (!datos) throw new ErrorAuth("REFRESH_INVALIDO", "Refresh token invalido, vuelve a iniciar sesion");

        const familia = familias.get(datos.familiaId);

        if (familia.revocada) throw new ErrorAuth("SESION_REVOCADA", "La sesion fue cerrada, vuelve a iniciar sesion");

        // reuso: este refresh ya se cambio antes. O el usuario lo uso dos veces, o alguien lo robo
        // como no se puede saber cual, se cierra toda la familia (el ladron y el dueno pierden la sesion)
        if (datos.usado) {
            familia.revocada = true;
            registro.push({ evento: "reuso_detectado", familiaId: datos.familiaId, usuarioId: datos.usuarioId, fecha: Date.now() });
            throw new ErrorAuth("REFRESH_REUSADO", "Este refresh token ya se uso. Por seguridad se cerro la sesion");
        }

        if (Date.now() >= datos.venceEn) throw new ErrorAuth("REFRESH_VENCIDO", "El refresh token vencio, vuelve a iniciar sesion");

        const usuario = buscarUsuario(datos.usuarioId);
        if (!usuario) throw new ErrorAuth("REFRESH_INVALIDO", "El usuario ya no existe");

        datos.usado = true;
        familia.ultimoUso = Date.now();
        return { access: firmarAccess(usuario, datos.familiaId), refresh: nuevoRefresh(usuario.id, datos.familiaId), familiaId: datos.familiaId };
    }

    function verificarAccess(token) {
        let payload;
        try {
            payload = jwt.verify(token, secreto);
        } catch (error) {
            // el cliente distingue este code: "vencio, pide uno nuevo con el refresh"
            if (error.name === "TokenExpiredError") throw new ErrorAuth("ACCESS_VENCIDO", "El access token vencio, usa /api/auth/refresh");
            throw new ErrorAuth("ACCESS_INVALIDO", "Access token invalido");
        }
        // si la sesion se cerro, el access deja de servir aunque no haya vencido
        if (familias.get(payload.fam)?.revocada !== false) throw new ErrorAuth("SESION_REVOCADA", "La sesion fue cerrada");
        return payload;
    }

    function revocarFamilia(familiaId) {
        const familia = familias.get(familiaId);
        if (familia) familia.revocada = true;
    }

    function revocarTodas(usuarioId) {
        let total = 0;
        for (const familia of familias.values()) {
            if (familia.usuarioId === usuarioId && !familia.revocada) {
                familia.revocada = true;
                total++;
            }
        }
        return total;
    }

    // familia a la que pertenece un refresh (para el logout con la cookie)
    const familiaDe = (refresh) => (refresh ? refreshs.get(hash(refresh))?.familiaId : undefined);

    function sesionesDe(usuarioId, familiaActual) {
        return [...familias.entries()]
            .filter(([, f]) => f.usuarioId === usuarioId && !f.revocada)
            .map(([id, f]) => ({ id, dispositivo: f.dispositivo, creada: new Date(f.creada).toISOString(), ultimoUso: new Date(f.ultimoUso).toISOString(), actual: id === familiaActual }));
    }

    return { iniciarSesion, rotar, verificarAccess, revocarFamilia, revocarTodas, familiaDe, sesionesDe, registro, refreshSegundos, guardados: () => [...refreshs.keys()] };
}
