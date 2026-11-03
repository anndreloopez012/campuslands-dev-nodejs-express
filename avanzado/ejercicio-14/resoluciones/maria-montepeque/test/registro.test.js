import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearRegistro, percentil } from "../src/metricas/registro.js";
import { aPrometheus } from "../src/metricas/formatos.js";

describe("tipos de metrica", () => {
    it("contador: suma por combinacion de etiquetas y no puede bajar", () => {
        const r = crearRegistro();
        const c = r.contador("prestamos_total", "x", ["genero"]);
        c.inc({ genero: "novela" });
        c.inc({ genero: "novela" }, 2);
        c.inc({ genero: "poesia" });

        assert.deepEqual(c.muestras(), [{ etiquetas: { genero: "novela" }, valor: 3 }, { etiquetas: { genero: "poesia" }, valor: 1 }]);
        assert.throws(() => c.inc({ genero: "novela" }, -1), /no puede bajar/);
    });

    it("una etiqueta que no se declaro da error", () => {
        const c = crearRegistro().contador("x_total", "x", ["genero"]);
        assert.throws(() => c.inc({ usuario: "ana" }), /no tiene las etiquetas: usuario/);
    });

    it("medidor: sube, baja y se puede fijar", () => {
        const g = crearRegistro().medidor("activos", "x");
        g.inc();
        g.inc();
        g.dec();
        assert.equal(g.muestras()[0].valor, 1);
        g.set(10);
        assert.equal(g.muestras()[0].valor, 10);
    });

    it("histograma: cada balde cuenta los valores menores o iguales", () => {
        const h = crearRegistro().histograma("dur", "x", [], { baldes: [0.1, 0.5, 1] });
        [0.05, 0.1, 0.3, 0.7, 3].forEach((v) => h.observar(v));

        const s = h.muestras()[0];
        assert.deepEqual(s.cuentas, [2, 3, 4]);
        assert.equal(s.total, 5);
        assert.equal(Math.round(s.suma * 100) / 100, 4.15);
    });

    it("nombres invalidos o repetidos dan error", () => {
        const r = crearRegistro();
        r.contador("ok_total", "x");
        assert.throws(() => r.contador("ok_total", "x"), /ya existe/);
        assert.throws(() => r.contador("con-guion", "x"), /invalido/);
    });
});

describe("percentil", () => {
    it("p50, p95 y p99 de 100 valores", () => {
        const valores = Array.from({ length: 100 }, (_, i) => i + 1);
        assert.equal(percentil(valores, 50), 50);
        assert.equal(percentil(valores, 95), 95);
        assert.equal(percentil(valores, 99), 99);
        assert.equal(percentil([], 99), 0);
    });
});

describe("formato Prometheus", () => {
    it("HELP, TYPE, etiquetas y los baldes con +Inf, _sum y _count", () => {
        const r = crearRegistro();
        r.contador("http_requests_total", "Peticiones", ["metodo"]).inc({ metodo: "GET" }, 3);
        r.histograma("dur_seconds", "Duracion", [], { baldes: [0.5] }).observar(0.2);

        assert.equal(
            aPrometheus(r),
            [
                "# HELP http_requests_total Peticiones",
                "# TYPE http_requests_total counter",
                'http_requests_total{metodo="GET"} 3',
                "# HELP dur_seconds Duracion",
                "# TYPE dur_seconds histogram",
                'dur_seconds_bucket{le="0.5"} 1',
                'dur_seconds_bucket{le="+Inf"} 1',
                "dur_seconds_sum 0.2",
                "dur_seconds_count 1",
                ""
            ].join("\n")
        );
    });

    it("escapa comillas en los valores de etiqueta", () => {
        const r = crearRegistro();
        r.contador("x_total", "x", ["titulo"]).inc({ titulo: 'El "Senor"' });
        assert.match(aPrometheus(r), /x_total\{titulo="El \\"Senor\\""\} 1/);
    });
});
