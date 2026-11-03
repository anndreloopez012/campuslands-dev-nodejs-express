import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { SEED_CHARACTERS } from "../src/services/characters.service.js";
import { startApp } from "../test-support/client.js";

let client;
beforeEach(async () => {
  client = await startApp(createApp());
});
afterEach(() => client.close());

const total = async () => (await client.request("GET", "/characters")).body.meta.total;
const character = async (id) => (await client.request("GET", `/characters/${id}`)).body.data;
const validNew = { name: "Nova", class: "guerrero", level: 3 };

describe("POST /characters", () => {
  it("crea el personaje: 201, Location y dueno tomado del token", async () => {
    const token = await client.loginAs("aria");
    const response = await client.request("POST", "/characters", { token, json: validNew });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get("location"), "/characters/9");
    assert.deepEqual(response.body, { ok: true, data: { id: 9, name: "Nova", class: "guerrero", level: 3, ownerId: 1 } });
    assert.deepEqual(await character(9), response.body.data);
    assert.equal(await total(), 9);
  });

  it("el dueno es quien tiene el token, no lo que diga el cuerpo", async () => {
    const created = await client.request("POST", "/characters", { token: await client.loginAs("brom"), json: validNew });

    assert.equal(created.body.data.ownerId, 2);
  });

  it("level vale 1 por defecto y el nombre se recorta", async () => {
    const created = await client.request("POST", "/characters", { token: await client.loginAs("aria"), json: { name: "  Nova  ", class: "mago" } });

    assert.equal(created.body.data.level, 1);
    assert.equal(created.body.data.name, "Nova");
  });

  for (const [label, json] of [["level minimo", { ...validNew, level: 1 }], ["level maximo", { ...validNew, level: 60 }], ["name de 2 caracteres", { ...validNew, name: "Ab" }], ["name de 30 caracteres", { ...validNew, name: "x".repeat(30) }]]) {
    it(`acepta ${label}`, async () => {
      assert.equal((await client.request("POST", "/characters", { token: await client.loginAs("aria"), json })).status, 201);
    });
  }

  it("exige autenticacion y no crea nada sin ella", async () => {
    assert.equal((await client.request("POST", "/characters", { json: validNew })).body.code, "MISSING_TOKEN");
    assert.equal((await client.request("POST", "/characters", { json: validNew, token: "falso" })).body.code, "INVALID_TOKEN");
    assert.equal(await total(), 8);
  });

  describe("validacion del cuerpo", () => {
    const invalid = [
      ["sin name", { class: "mago" }, "INVALID_BODY", /name/],
      ["name vacio", { ...validNew, name: "" }, "INVALID_BODY", /name/],
      ["name solo espacios", { ...validNew, name: "   " }, "INVALID_BODY", /name/],
      ["name de 1 caracter", { ...validNew, name: "A" }, "INVALID_BODY", /name/],
      ["name de 31 caracteres", { ...validNew, name: "x".repeat(31) }, "INVALID_BODY", /name/],
      ["name numerico", { ...validNew, name: 5 }, "INVALID_BODY", /name/],
      ["name nulo", { ...validNew, name: null }, "INVALID_BODY", /name/],
      ["sin class", { name: "Valido" }, "INVALID_BODY", /class/],
      ["class desconocida", { ...validNew, class: "bardo" }, "INVALID_BODY", /class/],
      ["class en mayuscula", { ...validNew, class: "Mago" }, "INVALID_BODY", /class/],
      ["level como texto", { ...validNew, level: "5" }, "INVALID_BODY", /level/],
      ["level decimal", { ...validNew, level: 5.5 }, "INVALID_BODY", /level/],
      ["level 0", { ...validNew, level: 0 }, "INVALID_BODY", /level/],
      ["level 61", { ...validNew, level: 61 }, "INVALID_BODY", /level/],
      ["level negativo", { ...validNew, level: -1 }, "INVALID_BODY", /level/],
      ["level nulo", { ...validNew, level: null }, "INVALID_BODY", /level/],
      ["objeto vacio", {}, "INVALID_BODY", /name/],
      ["arreglo", [], "INVALID_BODY", /objeto/],
      ["arreglo con datos", [validNew], "INVALID_BODY", /objeto/],
      ["campo id", { ...validNew, id: 99 }, "FIELD_NOT_ALLOWED", /id/],
      ["campo ownerId", { ...validNew, ownerId: 3 }, "FIELD_NOT_ALLOWED", /ownerId/],
      ["campo desconocido", { ...validNew, admin: true }, "FIELD_NOT_ALLOWED", /admin/],
    ];

    for (const [label, json, code, pattern] of invalid) {
      it(`400 ${code}: ${label}`, async () => {
        const response = await client.request("POST", "/characters", { token: await client.loginAs("aria"), json });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, code);
        assert.match(response.body.message, pattern);
        assert.equal(await total(), 8);
      });
    }

    it("400 si no hay cuerpo", async () => {
      const response = await client.request("POST", "/characters", { token: await client.loginAs("aria") });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "INVALID_BODY");
    });

    it("rechaza la clave __proto__ (intento de contaminar el prototipo)", async () => {
      const response = await client.request("POST", "/characters", { token: await client.loginAs("aria"), body: '{"name":"Valido","class":"mago","__proto__":{"admin":true}}', headers: { "Content-Type": "application/json" } });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "FIELD_NOT_ALLOWED");
      assert.equal(({}).admin, undefined);
    });
  });

  describe("nombres unicos", () => {
    for (const name of ["Lyra Alba", "lyra alba", "LYRA ALBA", "  Lyra Alba  ", "Lýra Alba"]) {
      it(`409 NAME_TAKEN: ${JSON.stringify(name)}`, async () => {
        const response = await client.request("POST", "/characters", { token: await client.loginAs("brom"), json: { ...validNew, name } });

        assert.equal(response.status, 409);
        assert.equal(response.body.code, "NAME_TAKEN");
        assert.equal(await total(), 8);
      });
    }

    it("un nombre liberado al borrar puede volver a usarse", async () => {
      const aria = await client.loginAs("aria");
      await client.request("DELETE", "/characters/1", { token: aria });

      assert.equal((await client.request("POST", "/characters", { token: aria, json: { ...validNew, name: "Lyra Alba" } })).status, 201);
    });
  });

  it("un intento fallido no consume ids: el siguiente exito recibe el 9", async () => {
    const token = await client.loginAs("aria");
    await client.request("POST", "/characters", { token, json: { name: "" } });
    await client.request("POST", "/characters", { token, json: { ...validNew, name: "Grimm" } });

    assert.equal((await client.request("POST", "/characters", { token, json: validNew })).body.data.id, 9);
  });
});

describe("PATCH /characters/:id", () => {
  const patch = (id, json, token) => client.request("PATCH", `/characters/${id}`, { json, token });

  it("el dueno cambia el nivel y solo cambia el nivel", async () => {
    const response = await patch(1, { level: 13 }, await client.loginAs("aria"));

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, { id: 1, name: "Lyra Alba", class: "clerigo", level: 13, ownerId: 1 });
    assert.deepEqual(await character(1), response.body.data);
  });

  it("cambia el nombre (recortado) y el nivel a la vez", async () => {
    const response = await patch(1, { name: "  Lyra Aurora ", level: 20 }, await client.loginAs("aria"));

    assert.deepEqual(response.body.data, { id: 1, name: "Lyra Aurora", class: "clerigo", level: 20, ownerId: 1 });
  });

  it("no toca a los demas personajes", async () => {
    const before = (await client.request("GET", "/characters")).body.data;
    await patch(1, { level: 13 }, await client.loginAs("aria"));
    const after = (await client.request("GET", "/characters")).body.data;

    assert.deepEqual(after.slice(1), before.slice(1));
  });

  it("un admin puede editar personajes ajenos", async () => {
    assert.equal((await patch(1, { level: 50 }, await client.loginAs("gm"))).status, 200);
  });

  it("otro jugador recibe 403 y el personaje no cambia", async () => {
    const response = await patch(1, { level: 50 }, await client.loginAs("brom"));

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "FORBIDDEN");
    assert.equal((await character(1)).level, 12);
  });

  it("matriz de permisos: solo el dueno o un admin, para cada personaje del catalogo", async () => {
    for (const actor of ["aria", "brom", "gm"]) {
      const token = await client.loginAs(actor);
      const userId = { aria: 1, brom: 2, gm: 3 }[actor];

      for (const [index, seeded] of SEED_CHARACTERS.entries()) {
        const expected = actor === "gm" || seeded.ownerId === userId ? 200 : 403;
        assert.equal((await patch(index + 1, { level: 20 }, token)).status, expected, `${actor} sobre el personaje ${index + 1}`);
      }
    }
  });

  it("exige autenticacion", async () => {
    assert.equal((await patch(1, { level: 13 })).body.code, "MISSING_TOKEN");
    assert.equal((await patch(1, { level: 13 }, "falso")).body.code, "INVALID_TOKEN");
    assert.equal((await character(1)).level, 12);
  });

  describe("orden de las validaciones", () => {
    it("404 antes que validar el cuerpo", async () => {
      assert.equal((await patch(99, {}, await client.loginAs("gm"))).status, 404);
    });

    it("403 antes que validar el cuerpo", async () => {
      assert.equal((await patch(1, { level: "x" }, await client.loginAs("brom"))).status, 403);
    });

    it("400 por id invalido antes que todo lo demas (tras autenticar)", async () => {
      const response = await patch("abc", { level: 5 }, await client.loginAs("aria"));

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "INVALID_ID");
    });
  });

  describe("cuerpo invalido", () => {
    const invalid = [
      ["objeto vacio", {}, "INVALID_BODY", /No hay campos/],
      ["arreglo", [], "INVALID_BODY", /objeto/],
      ["class (no editable)", { class: "mago" }, "FIELD_NOT_ALLOWED", /class/],
      ["ownerId (no editable)", { ownerId: 3 }, "FIELD_NOT_ALLOWED", /ownerId/],
      ["id (no editable)", { id: 99 }, "FIELD_NOT_ALLOWED", /id/],
      ["campo valido junto a uno no editable", { level: 5, class: "mago" }, "FIELD_NOT_ALLOWED", /class/],
      ["name vacio", { name: "" }, "INVALID_BODY", /name/],
      ["name de 1 caracter", { name: "A" }, "INVALID_BODY", /name/],
      ["name de 31 caracteres", { name: "x".repeat(31) }, "INVALID_BODY", /name/],
      ["name numerico", { name: 5 }, "INVALID_BODY", /name/],
      ["level 0", { level: 0 }, "INVALID_BODY", /level/],
      ["level 61", { level: 61 }, "INVALID_BODY", /level/],
      ["level como texto", { level: "5" }, "INVALID_BODY", /level/],
      ["level decimal", { level: 2.5 }, "INVALID_BODY", /level/],
      ["level nulo", { level: null }, "INVALID_BODY", /level/],
    ];

    for (const [label, json, code, pattern] of invalid) {
      it(`400 ${code}: ${label}`, async () => {
        const response = await patch(1, json, await client.loginAs("aria"));

        assert.equal(response.status, 400);
        assert.equal(response.body.code, code);
        assert.match(response.body.message, pattern);
        assert.deepEqual(await character(1), { id: 1, name: "Lyra Alba", class: "clerigo", level: 12, ownerId: 1 });
      });
    }

    it("400 si no hay cuerpo", async () => {
      const response = await client.request("PATCH", "/characters/1", { token: await client.loginAs("aria") });

      assert.equal(response.status, 400);
    });
  });

  describe("nombre repetido", () => {
    it("409 NAME_TAKEN al usar el nombre de otro personaje (sin importar mayusculas)", async () => {
      const response = await patch(1, { name: "elowen" }, await client.loginAs("aria"));

      assert.equal(response.status, 409);
      assert.equal(response.body.code, "NAME_TAKEN");
      assert.equal((await character(1)).name, "Lyra Alba");
    });

    it("un personaje puede cambiar la capitalizacion de su propio nombre", async () => {
      const response = await patch(1, { name: "lyra alba" }, await client.loginAs("aria"));

      assert.equal(response.status, 200);
      assert.equal(response.body.data.name, "lyra alba");
    });

    it("la operacion es atomica: si el nombre falla, el nivel enviado tampoco se aplica", async () => {
      await patch(1, { name: "Elowen", level: 55 }, await client.loginAs("aria"));

      assert.equal((await character(1)).level, 12);
    });
  });
});

describe("DELETE /characters/:id", () => {
  const remove = (id, token) => client.request("DELETE", `/characters/${id}`, { token });

  it("el dueno borra: 204 sin cuerpo ni Content-Type y el recurso desaparece", async () => {
    const response = await remove(1, await client.loginAs("aria"));

    assert.equal(response.status, 204);
    assert.equal(response.text, "");
    assert.equal(response.headers.get("content-type"), null);
    assert.equal((await client.request("GET", "/characters/1")).status, 404);
    assert.equal(await total(), 7);
  });

  it("borrar dos veces: la segunda da 404 (no es 204 de nuevo)", async () => {
    const token = await client.loginAs("aria");

    assert.equal((await remove(1, token)).status, 204);
    assert.equal((await remove(1, token)).status, 404);
  });

  it("no afecta a los demas y los ids no se reutilizan", async () => {
    const token = await client.loginAs("aria");
    await remove(1, token);
    const ids = (await client.request("GET", "/characters")).body.data.map((c) => c.id);
    const created = await client.request("POST", "/characters", { token, json: validNew });

    assert.deepEqual(ids, [2, 3, 4, 5, 6, 7, 8]);
    assert.equal(created.body.data.id, 9);
  });

  it("un admin puede borrar personajes ajenos", async () => {
    assert.equal((await remove(1, await client.loginAs("gm"))).status, 204);
  });

  it("otro jugador recibe 403 y el personaje sigue existiendo", async () => {
    const response = await remove(1, await client.loginAs("brom"));

    assert.equal(response.status, 403);
    assert.equal(response.body.code, "FORBIDDEN");
    assert.equal((await client.request("GET", "/characters/1")).status, 200);
  });

  it("exige autenticacion", async () => {
    assert.equal((await remove(1)).status, 401);
    assert.equal((await remove(1, "falso")).status, 401);
    assert.equal(await total(), 8);
  });

  it("400 con id invalido y 404 con id inexistente", async () => {
    const token = await client.loginAs("gm");

    assert.equal((await remove("abc", token)).body.code, "INVALID_ID");
    assert.equal((await remove(99, token)).body.code, "NOT_FOUND");
  });

  it("cerrar la sesion revoca tambien el permiso de borrar", async () => {
    const token = await client.loginAs("aria");
    await client.request("POST", "/auth/logout", { token });

    assert.equal((await remove(1, token)).status, 401);
    assert.equal(await total(), 8);
  });
});
