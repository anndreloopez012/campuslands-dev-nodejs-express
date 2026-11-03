import { createHmac, timingSafeEqual } from "node:crypto";

// firma de webhooks parecida a la de Stripe:
//   X-Firma: t=<segundos>,v1=<hmac sha256 de "t.cuerpo">
// - el hmac prueba que lo mando quien conoce el secreto
// - el t evita que alguien capture un webhook viejo y lo vuelva a mandar (replay)

export function firmar(secreto, cuerpo, t = Math.floor(Date.now() / 1000)) {
    const v1 = createHmac("sha256", secreto).update(`${t}.${cuerpo}`).digest("hex");
    return `t=${t},v1=${v1}`;
}

export function verificarFirma(secreto, cuerpo, cabecera, { ahora = Date.now(), toleranciaSeg = 300 } = {}) {
    if (!cabecera) return { valida: false, motivo: "falta la firma" };

    const partes = Object.fromEntries(
        cabecera.split(",").map((p) => {
            const i = p.indexOf("=");
            return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
        })
    );
    const t = Number(partes.t);
    if (!Number.isInteger(t) || !/^[0-9a-f]{64}$/.test(partes.v1 ?? "")) return { valida: false, motivo: "firma con formato invalido" };

    if (Math.abs(ahora / 1000 - t) > toleranciaSeg) return { valida: false, motivo: "la firma es muy vieja (posible replay)" };

    const esperada = Buffer.from(createHmac("sha256", secreto).update(`${t}.${cuerpo}`).digest("hex"));
    const recibida = Buffer.from(partes.v1);
    // comparacion en tiempo constante para no dar pistas con el tiempo de respuesta
    if (!timingSafeEqual(esperada, recibida)) return { valida: false, motivo: "la firma no coincide" };

    return { valida: true };
}
