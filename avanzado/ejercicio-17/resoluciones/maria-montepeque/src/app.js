import express from "express";
import { crearTokens, ErrorAuth } from "./auth/tokens.js";
import { leerCookies, cookieRefresh, borrarCookieRefresh } from "./http/cookies.js";

// usuarios de prueba (clave en texto plano solo porque el tema aqui son los tokens)
const USUARIOS = [
    { id: 1, nombre: "Lucia Viajera", email: "lucia@viajes.com", clave: "lucia12345" },
    { id: 2, nombre: "Pedro Mochila", email: "pedro@viajes.com", clave: "pedro12345" }
];

const RESERVAS = [
    { id: 1, usuarioId: 1, destino: "Tikal", fecha: "2026-12-10", personas: 2 },
    { id: 2, usuarioId: 1, destino: "Antigua Guatemala", fecha: "2027-01-05", personas: 1 },
    { id: 3, usuarioId: 2, destino: "Lago de Atitlan", fecha: "2026-12-20", personas: 4 }
];

export function crearApp({ secreto = process.env.JWT_SECRET || "secreto-solo-para-desarrollo", accessSegundos, refreshSegundos, produccion = process.env.NODE_ENV === "production" } = {}) {
    const tokens = crearTokens({ secreto, accessSegundos, refreshSegundos });
    const buscarUsuario = (id) => USUARIOS.find((u) => u.id === id);

    const app = express();
    app.use(express.json());

    // respuesta comun de login y refresh: el access en el body y el refresh en la cookie
    function entregar(res, { access, refresh }, status = 200) {
        res.set("Set-Cookie", cookieRefresh(refresh, { segundos: tokens.refreshSegundos, segura: produccion }));
        res.set("Cache-Control", "no-store");
        res.status(status).json({ ok: true, data: { accessToken: access, tipo: "Bearer" } });
    }

    function requireAuth(req, res, next) {
        const [tipo, token] = (req.get("Authorization") || "").split(" ");
        if (tipo !== "Bearer" || !token) return next(new ErrorAuth("SIN_TOKEN", "Falta Authorization: Bearer <access token>"));
        try {
            req.auth = tokens.verificarAccess(token);
            next();
        } catch (error) {
            next(error);
        }
    }

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "refresh tokens conceptual" }));

    app.post("/api/auth/login", (req, res, next) => {
        const { email, clave } = req.body || {};
        const usuario = USUARIOS.find((u) => u.email === email && u.clave === clave);
        if (!usuario) return next(new ErrorAuth("CREDENCIALES", "Credenciales incorrectas"));
        entregar(res, tokens.iniciarSesion(usuario, { dispositivo: req.get("User-Agent") || "desconocido" }));
    });

    // el refresh viaja solo en la cookie (no en el body), asi el JS del navegador nunca lo toca
    app.post("/api/auth/refresh", (req, res, next) => {
        try {
            entregar(res, tokens.rotar(leerCookies(req).refresh, buscarUsuario));
        } catch (error) {
            // si el refresh no sirve, borro la cookie para que el cliente no lo siga mandando
            res.set("Set-Cookie", borrarCookieRefresh());
            next(error);
        }
    });

    // cierra esta sesion (la del refresh de la cookie)
    app.post("/api/auth/logout", (req, res) => {
        const familia = tokens.familiaDe(leerCookies(req).refresh);
        if (familia) tokens.revocarFamilia(familia);
        res.set("Set-Cookie", borrarCookieRefresh());
        res.status(204).end();
    });

    // cierra todas las sesiones del usuario (por ejemplo si perdio el telefono)
    app.post("/api/auth/logout-todas", requireAuth, (req, res) => {
        const cerradas = tokens.revocarTodas(req.auth.sub);
        res.set("Set-Cookie", borrarCookieRefresh());
        res.json({ ok: true, data: { sesionesCerradas: cerradas } });
    });

    app.get("/api/auth/sesiones", requireAuth, (req, res) => {
        res.json({ ok: true, data: tokens.sesionesDe(req.auth.sub, req.auth.fam) });
    });

    app.get("/api/reservas", requireAuth, (req, res) => {
        res.json({ ok: true, data: RESERVAS.filter((r) => r.usuarioId === req.auth.sub) });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorAuth) return res.status(err.status).json({ ok: false, code: err.code, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.tokens = tokens;
    return app;
}
