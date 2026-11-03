import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearRepositorioEnMemoria } from "../src/repositories/compuestos.repository.js";
import { crearCompuestosService } from "../src/services/compuestos.service.js";
import TABLA_PERIODICA from "../src/data/tabla-periodica.js";

// aqui el service usa el repo y la tabla de verdad (sin mocks)

describe("service + repositorio en memoria", () => {
    it("registra y despues lo encuentra en la lista", async () => {
        const repo = crearRepositorioEnMemoria();
        const service = crearCompuestosService({ repo, tablaPeriodica: TABLA_PERIODICA });

        const guardado = await service.registrar({ nombre: "Acido sulfurico", formula: "H2SO4" });

        assert.equal(guardado.id, 1);
        assert.equal(guardado.masaMolar, 98.072);

        const lista = await service.listar();
        assert.equal(lista.length, 1);
        assert.equal(lista[0].formula, "H2SO4");
    });

    it("no deja registrar dos veces la misma formula", async () => {
        const repo = crearRepositorioEnMemoria([{ id: 1, nombre: "Agua", formula: "H2O", masaMolar: 18.015 }]);
        const service = crearCompuestosService({ repo, tablaPeriodica: TABLA_PERIODICA });

        await assert.rejects(service.registrar({ nombre: "Otra agua", formula: "H2O" }), { statusCode: 409 });
    });

    it("lo que devuelve el repo es una copia, cambiarlo no afecta lo guardado", async () => {
        const repo = crearRepositorioEnMemoria([{ id: 1, nombre: "Agua", formula: "H2O" }]);

        const lista = await repo.listar();
        lista[0].nombre = "cambiado";

        assert.equal((await repo.listar())[0].nombre, "Agua");
    });

    it("masa molar real del agua", () => {
        const service = crearCompuestosService({ repo: crearRepositorioEnMemoria(), tablaPeriodica: TABLA_PERIODICA });
        assert.equal(service.masaMolar("H2O").masaMolar, 18.015);
    });
});
