// el servidor si abre puertos de verdad (puerto 0 = el sistema elige uno libre)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearApp } from "../src/app.js";
import { crearServidor } from "../src/servidor.js";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

describe("servidor", () => {
    it("inicia en un puerto libre y responde por HTTP de verdad", async () => {
        const servidor = crearServidor(crearApp());
        const { url, puerto } = await servidor.iniciar();
        try {
            assert.ok(puerto > 0);
            const res = await fetch(`${url}/health`);
            assert.equal((await res.json()).topic, "separacion app server");
            assert.equal(servidor.estado(), "escuchando");
        } finally {
            await servidor.detener();
        }
        assert.equal(servidor.estado(), "detenido");
    });

    it("dos servidores con apps distintas no comparten datos", async () => {
        const a = crearServidor(crearApp());
        const b = crearServidor(crearApp());
        const [ia, ib] = await Promise.all([a.iniciar(), b.iniciar()]);
        try {
            assert.notEqual(ia.puerto, ib.puerto);
            await fetch(`${ia.url}/api/partidas/1/jugadores`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alias: "solo_en_a" }) });
            const enB = await (await fetch(`${ib.url}/api/partidas/1`)).json();
            assert.equal(enB.data.jugadores, 0);
        } finally {
            await Promise.all([a.detener(), b.detener()]);
        }
    });

    it("si el puerto esta ocupado da un error claro", async () => {
        const primero = crearServidor(crearApp());
        const { puerto } = await primero.iniciar();
        try {
            const segundo = crearServidor(crearApp(), { puerto });
            await assert.rejects(segundo.iniciar(), /ya esta en uso/);
            assert.equal(segundo.estado(), "detenido");
        } finally {
            await primero.detener();
        }
    });

    it("apagado limpio: espera la peticion lenta y ya no acepta nuevas", async () => {
        const mensajes = [];
        const servidor = crearServidor(crearApp(), { log: (m) => mensajes.push(m) });
        const { url } = await servidor.iniciar();

        const lenta = fetch(`${url}/api/partidas/1/repeticion?ms=300`);
        await esperar(50);
        assert.equal(servidor.enCurso(), 1);

        const apagado = servidor.detener();
        // una conexion nueva ya no entra
        await assert.rejects(fetch(`${url}/health/live`));

        const res = await lenta;
        assert.equal(res.status, 200);
        assert.equal((await res.json()).data.tardoMs, 300);
        assert.deepEqual(await apagado, { forzado: false, pendientes: 0 });
        assert.ok(mensajes.includes("apagado limpio"));
    });

    it("apagado forzado: si tarda mas que el limite, se corta", async () => {
        const servidor = crearServidor(crearApp(), { tiempoApagadoMs: 100 });
        const { url } = await servidor.iniciar();
        const lenta = fetch(`${url}/api/partidas/1/repeticion?ms=3000`);
        await esperar(50);

        const inicio = Date.now();
        const resultado = await servidor.detener();
        assert.equal(resultado.forzado, true);
        assert.ok(Date.now() - inicio < 1000, "no espero los 3 segundos");
        await assert.rejects(lenta);
    });

    it("llamar detener dos veces: la segunda tambien espera a que termine el apagado", async () => {
        const servidor = crearServidor(crearApp());
        const { url } = await servidor.iniciar();
        const orden = [];
        const lenta = fetch(`${url}/api/partidas/1/repeticion?ms=200`).then(() => orden.push("lenta termino"));
        await esperar(50);

        const uno = servidor.detener();
        const dos = servidor.detener().then((r) => {
            orden.push("segundo detener");
            return r;
        });
        assert.equal(uno, servidor.detener()); // es la misma promesa
        await Promise.all([lenta, dos]);
        assert.deepEqual(orden, ["lenta termino", "segundo detener"]);
    });
});
