import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCompoundsService, compoundsService } from "../src/services/compounds.service.js";

const water = { name: "Agua", formula: "H2O" };
const salt = { name: "Sal de mesa", formula: "NaCl" };
const glucose = { name: "Glucosa", formula: "C6H12O6" };
const hydrate = { name: "Sulfato de cobre pentahidratado", formula: "CuSO4·5H2O" };

function assertDomainError(action, code, messagePattern) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "DomainError");
    assert.equal(error.code, code);
    if (messagePattern) assert.match(error.message, messagePattern);
    return true;
  });
}

describe("createCompoundsService", () => {
  it("sin argumentos crea un servicio vacio", () => {
    assert.deepEqual(createCompoundsService().list(), []);
    assert.deepEqual(createCompoundsService(undefined).list(), []);
    assert.deepEqual(createCompoundsService({}).list(), []);
  });

  it("registra la semilla en orden con ids 1..n", () => {
    const service = createCompoundsService({ seed: [water, salt, glucose] });

    assert.deepEqual(service.list().map(({ id, name }) => [id, name]), [[1, "Agua"], [2, "Sal de mesa"], [3, "Glucosa"]]);
  });

  it("una semilla invalida hace fallar la creacion (falla rapido)", () => {
    assertDomainError(() => createCompoundsService({ seed: [water, { name: "Malo", formula: "Xx" }] }), "UNKNOWN_ELEMENT");
    assertDomainError(() => createCompoundsService({ seed: [water, water] }), "DUPLICATE_NAME");
  });

  it("las instancias son independientes: no comparten ids ni datos", () => {
    const a = createCompoundsService();
    const b = createCompoundsService();

    a.register(water);
    a.register(salt);

    assert.equal(b.list().length, 0);
    assert.equal(b.register(glucose).id, 1);
    assert.equal(a.list().length, 2);
  });
});

describe("compoundsService (la instancia que usa la app)", () => {
  it("viene con compuestos de ejemplo validos y consecutivos", () => {
    const compounds = compoundsService.list();

    assert.ok(compounds.length >= 3);
    assert.deepEqual(compounds.map(({ id }) => id), compounds.map((_, index) => index + 1));
    assert.ok(compounds.every(({ hill, molarMass }) => hill && molarMass > 0));
  });
});

describe("register", () => {
  let service;
  beforeEach(() => {
    service = createCompoundsService();
  });

  it("asigna ids consecutivos y devuelve el analisis completo", () => {
    assert.deepEqual(service.register(water), { id: 1, name: "Agua", formula: "H2O", hill: "H2O", composition: { H: 2, O: 1 }, molarMass: 18.015, massPercent: { H: 11.19, O: 88.81 } });
    assert.equal(service.register(salt).id, 2);
    assert.equal(service.register(glucose).id, 3);
  });

  it("devuelve una copia: mutar lo devuelto no altera lo guardado", () => {
    const registered = service.register(water);
    registered.name = "Alterado";
    registered.composition.O = 99;

    assert.equal(service.getById(1).name, "Agua");
    assert.equal(service.getById(1).composition.O, 1);
  });

  it("recorta el nombre y la formula", () => {
    const compound = service.register({ name: "  Agua  ", formula: " H2O " });

    assert.equal(compound.name, "Agua");
    assert.equal(compound.formula, "H2O");
  });

  it("calcula la formula de Hill aunque se escriba en otro orden", () => {
    assert.equal(service.register({ name: "Agua", formula: "OH2" }).hill, "H2O");
  });

  it("acepta nombres de exactamente 2 y de 60 caracteres", () => {
    assert.equal(service.register({ name: "Ag", formula: "Ag" }).id, 1);
    assert.equal(service.register({ name: "x".repeat(60), formula: "NaCl" }).id, 2);
  });

  for (const [label, name] of [["ausente", undefined], ["nulo", null], ["numerico", 42], ["vacio", ""], ["solo espacios", "   "], ["de 1 caracter", "A"], ["de 61 caracteres", "x".repeat(61)]]) {
    it(`rechaza un nombre ${label}`, () => assertDomainError(() => service.register({ name, formula: "H2O" }), "INVALID_INPUT", /name/));
  }

  for (const [label, input] of [["undefined", undefined], ["null", null], ["un objeto vacio", {}]]) {
    it(`rechaza el registro si la entrada es ${label}`, () => assertDomainError(() => service.register(input), "INVALID_INPUT"));
  }

  it("valida el nombre antes que la formula", () => {
    assertDomainError(() => service.register({ name: "", formula: "???" }), "INVALID_INPUT");
  });

  it("propaga los errores de formula", () => {
    assertDomainError(() => service.register({ name: "Raro", formula: "Xx" }), "UNKNOWN_ELEMENT");
    assertDomainError(() => service.register({ name: "Raro", formula: "(H2O" }), "INVALID_FORMULA");
    assertDomainError(() => service.register({ name: "Raro" }), "INVALID_FORMULA");
  });

  it("un registro fallido no consume ids ni deja rastro", () => {
    for (const bad of [{ name: "", formula: "H2O" }, { name: "Malo", formula: "Xx" }, { name: "Malo" }]) assert.throws(() => service.register(bad));

    assert.deepEqual(service.list(), []);
    assert.equal(service.register(water).id, 1);
  });

  describe("nombres repetidos", () => {
    beforeEach(() => {
      service.register(water);
    });

    for (const repeated of ["Agua", "agua", "AGUA", "  Agua  ", "Ágúa", "aGuA"]) {
      it(`rechaza ${JSON.stringify(repeated)} (mismo nombre sin importar mayusculas, acentos ni espacios)`, () => {
        assertDomainError(() => service.register({ name: repeated, formula: "NaCl" }), "DUPLICATE_NAME", /Agua.*id 1/);
      });
    }

    it("un rechazo por duplicado no agrega nada", () => {
      assert.throws(() => service.register({ name: "agua", formula: "NaCl" }));

      assert.equal(service.list().length, 1);
    });

    it("permite la misma formula con otro nombre (los isomeros comparten formula)", () => {
      const ethanol = service.register({ name: "Etanol", formula: "C2H6O" });
      const ether = service.register({ name: "Eter dimetilico", formula: "CH3OCH3" });

      assert.equal(ethanol.hill, ether.hill);
      assert.notEqual(ethanol.id, ether.id);
    });

    it("permite el mismo compuesto con otro nombre", () => {
      assert.equal(service.register({ name: "Oxido de hidrogeno", formula: "H2O" }).id, 2);
    });
  });
});

describe("list", () => {
  let service;
  beforeEach(() => {
    service = createCompoundsService({ seed: [water, salt, glucose, hydrate] });
  });

  it("devuelve todo en orden de registro", () => {
    assert.deepEqual(service.list().map(({ name }) => name), ["Agua", "Sal de mesa", "Glucosa", "Sulfato de cobre pentahidratado"]);
    assert.deepEqual(service.list({}).length, 4);
    assert.deepEqual(service.list({ element: undefined }).length, 4);
  });

  const filters = [
    ["O", ["Agua", "Glucosa", "Sulfato de cobre pentahidratado"]],
    ["H", ["Agua", "Glucosa", "Sulfato de cobre pentahidratado"]],
    ["Na", ["Sal de mesa"]],
    ["Cl", ["Sal de mesa"]],
    ["Cu", ["Sulfato de cobre pentahidratado"]],
    ["C", ["Glucosa"]],
    ["Zn", []],
  ];

  for (const [element, names] of filters) {
    it(`filtra por el elemento ${element}`, () => {
      assert.deepEqual(service.list({ element }).map(({ name }) => name), names);
    });
  }

  it("el filtro C no confunde Cl ni Cu con carbono (compara simbolos exactos)", () => {
    assert.deepEqual(service.list({ element: "C" }).map(({ name }) => name), ["Glucosa"]);
  });

  for (const element of ["o", "Xx", "", "__proto__", "constructor", 5, null, ["O", "H"]]) {
    it(`rechaza el elemento ${JSON.stringify(element)} con UNKNOWN_ELEMENT`, () => {
      assertDomainError(() => service.list({ element }), "UNKNOWN_ELEMENT");
    });
  }

  it("devuelve copias: mutar el resultado no altera el estado interno", () => {
    const first = service.list();
    first.push({ id: 99 });
    first[0].name = "Alterado";
    first[0].composition.H = 1000;

    const second = service.list();
    assert.equal(second.length, 4);
    assert.equal(second[0].name, "Agua");
    assert.equal(second[0].composition.H, 2);
  });
});

describe("getById", () => {
  let service;
  beforeEach(() => {
    service = createCompoundsService({ seed: [water, salt] });
  });

  it("encuentra por numero y por texto numerico", () => {
    assert.equal(service.getById(2).name, "Sal de mesa");
    assert.equal(service.getById("2").name, "Sal de mesa");
    assert.equal(service.getById(1).formula, "H2O");
  });

  for (const id of ["abc", "", " ", "0", "-1", "1.5", "1e3", "01", " 1", "1 ", null, undefined, {}, [], true, NaN, 1.5, -1, 0]) {
    it(`rechaza el id ${JSON.stringify(id) ?? String(id)} con INVALID_INPUT`, () => {
      assertDomainError(() => service.getById(id), "INVALID_INPUT", /entero positivo/);
    });
  }

  it("un id valido que no existe da NOT_FOUND", () => {
    assertDomainError(() => service.getById(99), "NOT_FOUND", /99/);
    assertDomainError(() => service.getById("3"), "NOT_FOUND");
  });

  it("devuelve una copia: mutarla no altera el estado interno", () => {
    const found = service.getById(1);
    found.name = "Alterado";
    found.massPercent.H = 0;

    assert.equal(service.getById(1).name, "Agua");
    assert.equal(service.getById(1).massPercent.H, 11.19);
  });

  it("registrar despues no cambia lo ya consultado", () => {
    const before = service.getById(1);
    service.register(glucose);

    assert.deepEqual(service.getById(1), before);
  });
});
