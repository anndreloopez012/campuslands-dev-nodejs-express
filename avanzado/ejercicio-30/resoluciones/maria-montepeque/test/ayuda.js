// ayuda para los tests: app nueva + login de cada rol
import request from "supertest";
import { crearApp } from "../src/app.js";
import { leerConfig } from "../src/config.js";

export const CLAVES = { recepcion: ["rosa", "recepcion123"], mecanico: ["beto", "mecanico123"], admin: ["ana", "admin12345"] };

export async function prepararTaller(opciones = {}) {
    const app = crearApp({ config: leerConfig({ NODE_ENV: "test" }), log: () => {}, ...opciones });
    const tokens = {};
    for (const [rol, [usuario, clave]] of Object.entries(CLAVES)) {
        tokens[rol] = (await request(app).post("/api/auth/login").send({ usuario, clave })).body.data.token;
    }
    // como("mecanico").post(url, body)
    const como = (rol) => {
        const con = (r) => r.set("Authorization", `Bearer ${tokens[rol]}`);
        return {
            get: (url) => con(request(app).get(url)),
            post: (url, body, headers = {}) => con(request(app).post(url)).set(headers).send(body),
            patch: (url, body) => con(request(app).patch(url)).send(body)
        };
    };
    return { app, como, store: app.locals.store };
}

// lleva una orden nueva de la moto indicada hasta "en_reparacion"
export async function ordenEnReparacion(como, motoId = 1) {
    const { body } = await como("recepcion").post("/api/ordenes", { motoId, problema: "Ruido en la cadena y frena mal", kilometraje: 15200 });
    const id = body.data.id;
    await como("mecanico").post(`/api/ordenes/${id}/estado`, { estado: "diagnostico" });
    await como("mecanico").post(`/api/ordenes/${id}/estado`, { estado: "en_reparacion" });
    return id;
}
