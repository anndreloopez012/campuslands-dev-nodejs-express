import { z } from "./zod.js";
import { ROLES, texto } from "./comunes.schema.js";

// un pick: que campeon y en que rol lo juega
const pick = z.strictObject({
    jugador: texto(3, 16),
    campeonId: z.number().int().positive(),
    rol: z.enum(ROLES)
});

const equipo = z.strictObject({
    nombre: texto(3, 30),
    // exactamente 5 picks
    picks: z.array(pick).length(5, { error: "cada equipo tiene exactamente 5 picks" }),
    bans: z.array(z.number().int().positive()).max(5, { error: "maximo 5 bans por equipo" }).default([])
});

// reglas que necesitan ver varios campos a la vez van en superRefine
// asi cada error sale con el campo exacto donde esta el problema
export const partidaCrear = z
    .strictObject({
        torneo: texto(3, 40),
        // "2026-11-02T20:00:00Z" -> se guarda como fecha ISO
        fecha: z.iso.datetime({ error: "fecha debe ser ISO, ej. 2026-11-02T20:00:00Z" }),
        duracionMin: z.number().int().min(15).max(80),
        ganador: z.enum(["azul", "rojo"]),
        azul: equipo,
        rojo: equipo
    })
    .superRefine((partida, ctx) => {
        const lados = ["azul", "rojo"];

        for (const lado of lados) {
            const { picks } = partida[lado];

            // en un equipo cada rol va una vez: top, jungla, mid, adc, soporte
            const roles = picks.map((p) => p.rol);
            ROLES.filter((r) => !roles.includes(r)).forEach((falta) => {
                ctx.addIssue({ code: "custom", path: [lado, "picks"], message: `al equipo ${lado} le falta el rol ${falta}` });
            });

            // un jugador no puede estar dos veces en el mismo equipo
            const jugadores = picks.map((p) => p.jugador.toLowerCase());
            jugadores.forEach((j, i) => {
                if (jugadores.indexOf(j) !== i) {
                    ctx.addIssue({ code: "custom", path: [lado, "picks", i, "jugador"], message: `${picks[i].jugador} esta repetido` });
                }
            });

            // no se puede banear dos veces el mismo
            const { bans } = partida[lado];
            bans.forEach((b, i) => {
                if (bans.indexOf(b) !== i) {
                    ctx.addIssue({ code: "custom", path: [lado, "bans", i], message: `el campeon ${b} esta baneado dos veces` });
                }
            });
        }

        // un campeon solo lo puede elegir un jugador en toda la partida
        const todosLosPicks = lados.flatMap((lado) => partida[lado].picks.map((p, i) => ({ lado, i, id: p.campeonId })));
        const vistos = new Map();
        for (const p of todosLosPicks) {
            if (vistos.has(p.id)) {
                ctx.addIssue({ code: "custom", path: [p.lado, "picks", p.i, "campeonId"], message: `el campeon ${p.id} ya lo eligio el equipo ${vistos.get(p.id)}` });
            } else {
                vistos.set(p.id, p.lado);
            }
        }

        // y un campeon baneado (por cualquiera) no se puede elegir
        const baneados = new Set([...partida.azul.bans, ...partida.rojo.bans]);
        for (const p of todosLosPicks) {
            if (baneados.has(p.id)) {
                ctx.addIssue({ code: "custom", path: [p.lado, "picks", p.i, "campeonId"], message: `el campeon ${p.id} esta baneado` });
            }
        }
    });
