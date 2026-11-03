// chequeos de salud para el orquestador (docker, kubernetes, la nube)
// - live: el proceso responde (si falla, lo reinician)
// - ready: el proceso Y sus dependencias estan bien (si falla, no le mandan trafico)

function conTimeout(promesa, ms) {
    let timer;
    return Promise.race([promesa, new Promise((_, rechazar) => (timer = setTimeout(() => rechazar(new Error(`no respondio en ${ms} ms`)), ms)))]).finally(() => clearTimeout(timer));
}

export function crearSalud({ dependencias = [], timeoutMs = 1000, version }) {
    const inicio = Date.now();
    let apagando = false;

    async function revisar() {
        // todas en paralelo, cada una con su timeout, ninguna tumba a las otras
        const resultados = await Promise.all(
            dependencias.map(async ({ nombre, revisar: fn }) => {
                const t0 = performance.now();
                try {
                    await conTimeout(Promise.resolve().then(fn), timeoutMs);
                    return { nombre, ok: true, ms: Math.round(performance.now() - t0) };
                } catch (err) {
                    return { nombre, ok: false, ms: Math.round(performance.now() - t0), error: err.message };
                }
            })
        );
        return { listo: !apagando && resultados.every((r) => r.ok), apagando, dependencias: resultados };
    }

    return {
        marcarApagando: () => {
            apagando = true;
        },
        live: (req, res) => res.json({ ok: true, estado: "vivo", activoSeg: Math.floor((Date.now() - inicio) / 1000) }),
        ready: async (req, res) => {
            const r = await revisar();
            res.status(r.listo ? 200 : 503).json({ ok: r.listo, ...r });
        },
        version: (req, res) => res.json({ ok: true, ...version })
    };
}
