import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { Bus } from "../src/eventos/bus.js";

describe("Bus", () => {
    it("publicar llama a los suscriptores en orden y de forma sincrona", () => {
        const bus = new Bus();
        const orden = [];
        bus.suscribir("pedido.creado", "a", () => orden.push("a"));
        bus.suscribir("pedido.creado", "b", () => orden.push("b"));

        bus.publicar("pedido.creado", {});
        orden.push("despues de publicar");

        assert.deepEqual(orden, ["a", "b", "despues de publicar"]);
    });

    it("el mensaje lleva id, evento, datos y fecha", () => {
        const bus = new Bus();
        const m1 = bus.publicar("pedido.creado", { x: 1 });
        const m2 = bus.publicar("pedido.creado", { x: 2 });

        assert.equal(m1.evento, "pedido.creado");
        assert.deepEqual(m1.datos, { x: 1 });
        assert.equal(m2.id, m1.id + 1);
        assert.ok(!Number.isNaN(Date.parse(m1.fecha)));
    });

    it("un evento que no existe da error (evita typos)", () => {
        assert.throws(() => new Bus().publicar("pedido.creaddo", {}), /no existe/);
    });

    it("* ve los eventos en el orden real aunque un suscriptor publique otro adentro", () => {
        const bus = new Bus();
        const vistos = [];
        bus.suscribir("*", "auditoria", (m) => vistos.push(m.evento));
        bus.suscribir("pedido.creado", "inventario", () => bus.publicar("pedido.confirmado", {}));

        bus.publicar("pedido.creado", {});

        assert.deepEqual(vistos, ["pedido.creado", "pedido.confirmado"]);
    });

    it("* recibe todos los eventos", () => {
        const bus = new Bus();
        const vistos = [];
        bus.suscribir("*", "todo", (m) => vistos.push(m.evento));

        bus.publicar("pedido.creado", {});
        bus.publicar("pedido.entregado", {});

        assert.deepEqual(vistos, ["pedido.creado", "pedido.entregado"]);
    });

    it("si un suscriptor tira error, los demas siguen y queda registrado", () => {
        const bus = new Bus();
        const recibidos = [];
        bus.suscribir("pedido.creado", "roto", () => {
            throw new Error("me rompi");
        });
        bus.suscribir("pedido.creado", "sano", () => recibidos.push("sano"));

        assert.doesNotThrow(() => bus.publicar("pedido.creado", {}));
        assert.deepEqual(recibidos, ["sano"]);
        assert.deepEqual(bus.errores.map((e) => [e.suscriptor, e.error]), [["roto", "me rompi"]]);
    });

    it("los errores de suscriptores async tambien se atrapan", async () => {
        const bus = new Bus();
        bus.suscribir("pedido.creado", "async-roto", async () => {
            throw new Error("fallo despues");
        });

        bus.publicar("pedido.creado", {});
        await new Promise((r) => setImmediate(r));

        assert.equal(bus.errores[0].error, "fallo despues");
    });

    it("desuscribirse deja de recibir", () => {
        const bus = new Bus();
        let veces = 0;
        const salir = bus.suscribir("pedido.creado", "x", () => veces++);

        bus.publicar("pedido.creado", {});
        salir();
        bus.publicar("pedido.creado", {});

        assert.equal(veces, 1);
        assert.equal(bus.resumen()["pedido.creado"], 0);
    });

    it("se puede esperar un evento con events.once", async () => {
        const bus = new Bus();
        setTimeout(() => bus.publicar("pedido.entregado", { pedidoId: 7 }), 5);

        const [mensaje] = await once(bus, "pedido.entregado");
        assert.equal(mensaje.datos.pedidoId, 7);
    });
});
