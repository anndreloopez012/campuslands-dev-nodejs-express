import { ColaLlena } from "../concurrencia/limitador.js";
import { ErrorEscena } from "./escenas.js";

// trabajos de render: pesados, por eso pasan por el limitador
// ademas cada animador puede tener como maximo N renders pendientes

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export function crearRenders({ limitador, escenas, msPorFrame = 2, maxPorUsuario = 2 }) {
    const trabajos = new Map();
    let siguienteId = 1;

    const pendientesDe = (usuario) => [...trabajos.values()].filter((t) => t.usuario === usuario && (t.estado === "en_cola" || t.estado === "renderizando")).length;

    function encolar(usuario, escenaId) {
        const escena = escenas.ver(escenaId);
        if (pendientesDe(usuario) >= maxPorUsuario) {
            throw new ErrorEscena(429, `Ya tienes ${maxPorUsuario} renders pendientes, espera a que termine uno`, { retryAfter: 2 });
        }
        if (!limitador.hayLugar()) throw new ColaLlena(limitador.estado().maxCola);

        const trabajo = { id: siguienteId++, usuario, escenaId, frames: escena.frames, estado: "en_cola", progreso: 0, creado: new Date().toISOString() };
        trabajos.set(trabajo.id, trabajo);

        // no espero aqui: la ruta responde 202 y el render sigue solo
        limitador
            .ejecutar(async () => {
                trabajo.estado = "renderizando";
                for (let f = 1; f <= trabajo.frames; f++) {
                    await esperar(msPorFrame);
                    trabajo.progreso = Math.round((f / trabajo.frames) * 100);
                }
            })
            .then(() => {
                trabajo.estado = "listo";
                trabajo.archivo = `render-${trabajo.id}.mp4`;
            })
            .catch((err) => {
                trabajo.estado = "fallido";
                trabajo.error = err.message;
            });

        return { ...trabajo };
    }

    function ver(id) {
        const t = trabajos.get(id);
        if (!t) throw new ErrorEscena(404, `No existe el render ${id}`);
        return { ...t };
    }

    return { encolar, ver };
}
