import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAuthService, permissionsOf, hasPermission } from "../src/services/auth.service.js";

function assertAppError(action, status, code) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

describe("createAuthService", () => {
  it("requiere jwtSecret para poder crearse", () => {
    assert.throws(() => createAuthService(), /jwtSecret/);
    assert.throws(() => createAuthService({ jwtSecret: "" }), /jwtSecret/);
  });

  it("login emite un token que verify puede leer de vuelta", () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas" });
    const { token, user } = auth.login({ username: "recepcion", password: "demo123" });

    assert.deepEqual(auth.verify(token), { id: user.id, username: user.username, role: user.role });
  });

  it("400 INVALID_BODY si falta username o password", () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas" });

    assertAppError(() => auth.login({ username: "recepcion" }), 400, "INVALID_BODY");
    assertAppError(() => auth.login({}), 400, "INVALID_BODY");
  });

  it("401 INVALID_CREDENTIALS con password incorrecta o usuario inexistente", () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas" });

    assertAppError(() => auth.login({ username: "recepcion", password: "mala" }), 401, "INVALID_CREDENTIALS");
    assertAppError(() => auth.login({ username: "nadie", password: "demo123" }), 401, "INVALID_CREDENTIALS");
  });

  it("401 INVALID_TOKEN con un token firmado con otra clave", () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas" });
    const { token } = createAuthService({ jwtSecret: "otra-clave" }).login({ username: "recepcion", password: "demo123" });

    assertAppError(() => auth.verify(token), 401, "INVALID_TOKEN");
  });

  it("401 INVALID_TOKEN con basura en vez de un token", () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas" });

    assertAppError(() => auth.verify("no-es-un-jwt"), 401, "INVALID_TOKEN");
  });

  it("401 TOKEN_EXPIRED con un token vencido", async () => {
    const auth = createAuthService({ jwtSecret: "clave-de-pruebas", jwtExpiresIn: "1ms" });
    const { token } = auth.login({ username: "recepcion", password: "demo123" });

    await new Promise((resolve) => setTimeout(resolve, 50));
    assertAppError(() => auth.verify(token), 401, "TOKEN_EXPIRED");
  });
});

describe("permissionsOf / hasPermission", () => {
  it("cada rol sembrado tiene al menos un permiso", () => {
    for (const role of ["recepcionista", "mecanico", "admin"]) assert.ok(permissionsOf(role).length > 0);
  });

  it("un rol desconocido no tiene permisos", () => {
    assert.deepEqual(permissionsOf("invitado"), []);
    assert.equal(hasPermission("invitado", "motorcycles:read"), false);
  });

  it("admin tiene todos los permisos que tiene cualquier otro rol", () => {
    for (const permission of new Set([...permissionsOf("recepcionista"), ...permissionsOf("mecanico")])) assert.equal(hasPermission("admin", permission), true);
  });
});
