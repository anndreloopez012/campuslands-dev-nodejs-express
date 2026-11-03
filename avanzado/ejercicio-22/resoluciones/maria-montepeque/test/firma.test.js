import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { firmar, verificarFirma } from "../src/webhooks/firma.js";

const secreto = "secreto-de-pruebas-123";
const cuerpo = '{"id":"evt_1","tipo":"render.iniciado"}';
const ahora = 1_800_000_000_000;
const t = ahora / 1000;

describe("firma de webhooks", () => {
    it("una firma correcta es valida", () => {
        assert.deepEqual(verificarFirma(secreto, cuerpo, firmar(secreto, cuerpo, t), { ahora }), { valida: true });
    });

    it("si cambia un solo caracter del cuerpo ya no es valida", () => {
        const firma = firmar(secreto, cuerpo, t);
        assert.equal(verificarFirma(secreto, cuerpo.replace("iniciado", "iniciadx"), firma, { ahora }).motivo, "la firma no coincide");
    });

    it("con otro secreto no es valida", () => {
        assert.equal(verificarFirma(secreto, cuerpo, firmar("otro-secreto-cualquiera", cuerpo, t), { ahora }).valida, false);
    });

    it("una firma de hace mas de 5 minutos se rechaza (replay)", () => {
        const vieja = firmar(secreto, cuerpo, t - 301);
        assert.match(verificarFirma(secreto, cuerpo, vieja, { ahora }).motivo, /replay/);
        assert.equal(verificarFirma(secreto, cuerpo, firmar(secreto, cuerpo, t - 299), { ahora }).valida, true);
    });

    it("no se puede cambiar el t sin recalcular la firma", () => {
        const firma = firmar(secreto, cuerpo, t - 1000).replace(`t=${t - 1000}`, `t=${t}`);
        assert.equal(verificarFirma(secreto, cuerpo, firma, { ahora }).valida, false);
    });

    it("sin firma o con basura no revienta", () => {
        assert.equal(verificarFirma(secreto, cuerpo, undefined).motivo, "falta la firma");
        assert.equal(verificarFirma(secreto, cuerpo, "hola").motivo, "firma con formato invalido");
        assert.equal(verificarFirma(secreto, cuerpo, `t=${t},v1=abc`, { ahora }).motivo, "firma con formato invalido");
    });
});
