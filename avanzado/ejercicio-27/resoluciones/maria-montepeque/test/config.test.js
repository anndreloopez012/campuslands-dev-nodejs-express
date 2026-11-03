import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { cargarConfig, configPublica, duracionAMs, ErrorConfig } from "../src/config/cargar.js";
import { parsearEnv } from "../src/config/dotenv.js";

// cada test usa una carpeta temporal con sus propios config/*.json y .env
let carpeta;
beforeEach(async () => {
    carpeta = await mkdtemp(path.join(tmpdir(), "config-test-"));
    await mkdir(path.join(carpeta, "config"));
});
afterEach(() => rm(carpeta, { recursive: true, force: true }));

const escribirJson = (entorno, datos) => writeFile(path.join(carpeta, "config", `${entorno}.json`), JSON.stringify(datos));
const cargar = (env = {}) => cargarConfig({ env, carpeta });

function erroresDe(fn) {
    try {
        fn();
    } catch (err) {
        assert.ok(err instanceof ErrorConfig, err.message);
        return err.errores;
    }
    assert.fail("se esperaba ErrorConfig");
}

const PROD_OK = { NODE_ENV: "production", URL_BASE: "https://api.moba.gg", API_KEY_ESTADISTICAS: "llave-de-produccion-123456", JWT_SECRETO: "x".repeat(40) };

describe("parsearEnv", () => {
    it("lee claves, comillas, comentarios y export", () => {
        const texto = '# comentario\nPORT=5000\nexport REGION=KR\nNOMBRE="Liga Latam" # nombre\nLITERAL=\'a\\nb\'\nSALTO="a\\nb"\nVACIA=\n\r\nCON_HASH=abc#123';
        assert.deepEqual(parsearEnv(texto), { PORT: "5000", REGION: "KR", NOMBRE: "Liga Latam", LITERAL: "a\\nb", SALTO: "a\nb", VACIA: "", CON_HASH: "abc#123" });
    });

    it("dice la linea del error", () => {
        assert.throws(() => parsearEnv("BIEN=1\nesto esta mal"), /linea 2/);
        assert.throws(() => parsearEnv('X="sin cerrar'), /comilla/);
    });
});

describe("capas: defecto < config/<entorno>.json < .env < variables reales", () => {
    it("sin nada usa los valores por defecto y convierte los tipos", () => {
        const c = cargar();
        assert.deepEqual([c.puerto, c.entorno, c.region, c.draft.tiempoTurno, c.funciones.modoRanked], [4027, "development", "LAN", 30_000, false]);
    });

    it("el json del entorno pisa al defecto, el .env al json y el entorno real a todos", async () => {
        await escribirJson("development", { region: "NA", draft: { bansPorEquipo: 2 }, logNivel: "debug" });
        await writeFile(path.join(carpeta, ".env"), "REGION=EUW\nDRAFT_BANS=1\n");

        const c = cargar({ REGION: "KR" });
        assert.equal(c.region, "KR"); // entorno real
        assert.equal(c.draft.bansPorEquipo, 1); // .env
        assert.equal(c.logNivel, "debug"); // json
        assert.equal(c.draft.tamanoEquipo, 5); // defecto
    });

    it("el entorno elige que json se carga", async () => {
        await escribirJson("test", { logNivel: "error" });
        assert.equal(cargar({ NODE_ENV: "test" }).logNivel, "error");
        assert.equal(cargar({ NODE_ENV: "development" }).logNivel, "info");
    });
});

describe("validacion", () => {
    it("junta TODOS los errores, no solo el primero", () => {
        const errores = erroresDe(() => cargar({ PORT: "80a", REGION: "MARTE", DRAFT_TIEMPO_TURNO: "30 segundos", FUNCION_RANKED: "talvez" }));
        assert.equal(errores.length, 4);
        assert.match(errores.join("\n"), /PORT.*entero/);
        assert.match(errores.join("\n"), /REGION/);
    });

    it("reglas que cruzan opciones: bans no puede ser mayor que el tamano del equipo", () => {
        assert.match(erroresDe(() => cargar({ DRAFT_TAMANO_EQUIPO: "2", DRAFT_BANS: "3" }))[0], /bansPorEquipo no puede ser mayor/);
    });

    it("en production los secretos son obligatorios (no vale el de desarrollo) y la url debe ser https", () => {
        const errores = erroresDe(() => cargar({ NODE_ENV: "production" }));
        assert.ok(errores.some((e) => /apiKeyEstadisticas es obligatoria/.test(e)));
        assert.ok(errores.some((e) => /jwtSecreto es obligatoria/.test(e)));
        assert.ok(errores.some((e) => /https/.test(e)));
        assert.equal(cargar(PROD_OK).entorno, "production");
    });

    it("un secreto en config/*.json se rechaza (esos archivos se suben al repo)", async () => {
        await escribirJson("development", { secretos: { jwtSecreto: "y".repeat(40) } });
        assert.match(erroresDe(() => cargar())[0], /es secreta: no va en config/);
    });

    it("booleanos y duraciones con varios formatos", () => {
        assert.equal(cargar({ FUNCION_RANKED: "si" }).funciones.modoRanked, true);
        assert.equal(cargar({ FUNCION_RANKED: "0" }).funciones.modoRanked, false);
        assert.deepEqual(["250ms", "45s", "2m", "1h", "10"].map(duracionAMs), [250, 45_000, 120_000, 3_600_000, null]);
    });
});

describe("seguridad de la config", () => {
    it("queda congelada (nadie la puede cambiar en tiempo de ejecucion)", () => {
        const c = cargar();
        assert.throws(() => {
            c.draft.bansPorEquipo = 99;
        }, TypeError);
    });

    it("la version publica nunca muestra secretos", () => {
        const publica = configPublica(cargar(PROD_OK));
        assert.deepEqual(publica.secretos, { apiKeyEstadisticas: "[configurado]", jwtSecreto: "[configurado]" });
        assert.doesNotMatch(JSON.stringify(publica), /llave-de-produccion|xxxx/);
    });
});
