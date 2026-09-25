import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const CONFIG_MODULE_URL = new URL("../src/config/index.js", import.meta.url).href;

function loadConfigWith(env) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", `import { loadConfig } from ${JSON.stringify(CONFIG_MODULE_URL)}; console.log(JSON.stringify(loadConfig()));`], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

describe("loadConfig", () => {
  it("con valores por defecto arranca en development con el puerto 4030 y una clave de desarrollo", () => {
    const result = loadConfigWith({ NODE_ENV: "", PORT: "", JWT_SECRET: "", JWT_EXPIRES_IN: "" });

    assert.equal(result.status, 0);
    assert.deepEqual(JSON.parse(result.stdout), { env: "development", port: 4030, jwtSecret: "dev-secret-change-me", jwtExpiresIn: "15m" });
  });

  it("respeta las variables de entorno cuando estan presentes", () => {
    const result = loadConfigWith({ NODE_ENV: "test", PORT: "5000", JWT_SECRET: "clave-de-prueba", JWT_EXPIRES_IN: "1h" });

    assert.deepEqual(JSON.parse(result.stdout), { env: "test", port: 5000, jwtSecret: "clave-de-prueba", jwtExpiresIn: "1h" });
  });

  for (const [label, env] of [
    ["NODE_ENV desconocido", { NODE_ENV: "staging" }],
    ["PORT no numerico", { PORT: "abc" }],
    ["PORT fuera de rango", { PORT: "99999" }],
    ["produccion sin JWT_SECRET", { NODE_ENV: "production", JWT_SECRET: "" }],
  ]) {
    it(`falla al arrancar (exit code 1) con: ${label}`, () => {
      const result = loadConfigWith(env);

      assert.notEqual(result.status, 0);
    });
  }

  it("en produccion con JWT_SECRET explicito arranca sin usar la clave de desarrollo", () => {
    const result = loadConfigWith({ NODE_ENV: "production", JWT_SECRET: "clave-real" });

    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).jwtSecret, "clave-real");
  });
});
