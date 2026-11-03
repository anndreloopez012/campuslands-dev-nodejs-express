import request from "supertest";
import app from "../src/app.js";

// claves de los usuarios de prueba de src/data/db.js
export const USUARIOS = {
    recepcion: { email: "ana@taller.com", password: "recepcion123" },
    beto: { email: "beto@taller.com", password: "mecanico123" },
    carla: { email: "carla@taller.com", password: "mecanico456" },
    admin: { email: "admin@taller.com", password: "admin12345" }
};

// hace login y devuelve el header listo para usar
export async function auth(quien) {
    const res = await request(app).post("/api/auth/login").send(USUARIOS[quien]);
    if (res.status !== 200) {
        throw new Error(`No se pudo hacer login como ${quien}: ${res.status}`);
    }
    return { Authorization: `Bearer ${res.body.data.token}` };
}

// todos los tokens de una vez
export async function todasLasSesiones() {
    const [recepcion, beto, carla, admin] = await Promise.all(["recepcion", "beto", "carla", "admin"].map(auth));
    return { recepcion, beto, carla, admin };
}

export { app, request };
