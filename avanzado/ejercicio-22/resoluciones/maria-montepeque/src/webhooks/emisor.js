import { randomUUID } from "node:crypto";
import { firmar } from "./firma.js";

// manda webhooks a los suscriptores
// - cada entrega va firmada con el secreto del suscriptor
// - si falla (error de red o status que no es 2xx) se reintenta con espera exponencial
// - si se acaban los intentos, la entrega queda en "muertos" para revisarla a mano

const esperarReal = (ms) => new Promise((r) => setTimeout(r, ms));

// envio de verdad con fetch (en los tests se cambia por uno falso)
async function enviarConFetch(url, { headers, cuerpo }) {
    const res = await fetch(url, { method: "POST", headers, body: cuerpo, signal: AbortSignal.timeout(3000) });
    return { status: res.status };
}

export function crearEmisor({ enviar = enviarConFetch, intentos = 4, baseMs = 200, esperar = esperarReal, reloj = Date.now } = {}) {
    const suscripciones = new Map();
    const entregas = [];
    const muertos = [];
    let siguienteId = 1;

    function suscribir({ url, eventos, secreto }) {
        const s = { id: siguienteId++, url, eventos, secreto, activa: true };
        suscripciones.set(s.id, s);
        return s;
    }

    // "proyecto.*" escucha todos los de proyecto
    const leInteresa = (s, tipo) => s.activa && s.eventos.some((e) => e === "*" || e === tipo || (e.endsWith(".*") && tipo.startsWith(e.slice(0, -1))));

    async function entregar(s, evento) {
        const cuerpo = JSON.stringify(evento);
        const entrega = { suscripcionId: s.id, eventoId: evento.id, tipo: evento.tipo, intentos: [], estado: "pendiente" };
        entregas.push(entrega);

        for (let n = 1; n <= intentos; n++) {
            // se firma en cada intento porque el tiempo cambia
            const headers = {
                "Content-Type": "application/json",
                "X-Evento-Id": evento.id,
                "X-Evento-Tipo": evento.tipo,
                "X-Intento": String(n),
                "X-Firma": firmar(s.secreto, cuerpo, Math.floor(reloj() / 1000))
            };
            try {
                const { status } = await enviar(s.url, { headers, cuerpo });
                entrega.intentos.push({ n, status });
                if (status >= 200 && status < 300) {
                    entrega.estado = "entregado";
                    return entrega;
                }
                // un 4xx (menos 408 y 429) no se arregla reintentando
                if (status >= 400 && status < 500 && status !== 408 && status !== 429) break;
            } catch (err) {
                entrega.intentos.push({ n, error: err.message });
            }
            // espera: 200, 400, 800... ms
            if (n < intentos) await esperar(baseMs * 2 ** (n - 1));
        }

        entrega.estado = "fallido";
        muertos.push(entrega);
        return entrega;
    }

    // crea el evento y lo manda a todos los interesados (en paralelo)
    async function emitir(tipo, datos) {
        const evento = { id: `evt_${randomUUID()}`, tipo, fecha: new Date(reloj()).toISOString(), datos };
        const destinos = [...suscripciones.values()].filter((s) => leInteresa(s, tipo));
        const resultados = await Promise.all(destinos.map((s) => entregar(s, evento)));
        return { evento, entregas: resultados };
    }

    // volver a intentar una entrega muerta
    async function reintentarMuerto(indice) {
        const muerto = muertos[indice];
        if (!muerto) return null;
        muertos.splice(indice, 1);
        const s = suscripciones.get(muerto.suscripcionId);
        return entregar(s, { id: muerto.eventoId, tipo: muerto.tipo, fecha: new Date(reloj()).toISOString(), reintento: true });
    }

    return {
        suscribir,
        emitir,
        reintentarMuerto,
        suscripciones: () => [...suscripciones.values()].map(({ secreto, ...s }) => s),
        entregas: () => entregas,
        muertos: () => muertos
    };
}
