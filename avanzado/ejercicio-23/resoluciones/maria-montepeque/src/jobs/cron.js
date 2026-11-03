// mini parser de expresiones cron de 5 campos (todo en UTC):
//   minuto hora dia-del-mes mes dia-de-la-semana
// soporta: *  */15  5  1,15,30  9-17  1-5/2
// ejemplo: "0 7 * * 1-5" = a las 07:00 de lunes a viernes

const CAMPOS = [
    { nombre: "minuto", min: 0, max: 59 },
    { nombre: "hora", min: 0, max: 23 },
    { nombre: "dia", min: 1, max: 31 },
    { nombre: "mes", min: 1, max: 12 },
    { nombre: "diaSemana", min: 0, max: 6 } // 0 = domingo
];

export class ErrorCron extends Error {}

function parsearCampo(texto, { nombre, min, max }) {
    const valores = new Set();
    for (const parte of texto.split(",")) {
        const [rango, pasoTexto] = parte.split("/");
        const paso = pasoTexto === undefined ? 1 : Number(pasoTexto);
        if (!Number.isInteger(paso) || paso < 1) throw new ErrorCron(`paso invalido en ${nombre}: "${parte}"`);

        let desde;
        let hasta;
        if (rango === "*") {
            [desde, hasta] = [min, max];
        } else if (/^\d+-\d+$/.test(rango)) {
            [desde, hasta] = rango.split("-").map(Number);
        } else if (/^\d+$/.test(rango)) {
            desde = Number(rango);
            // "5/10" significa desde 5 hasta el final cada 10
            hasta = pasoTexto === undefined ? desde : max;
        } else {
            throw new ErrorCron(`valor invalido en ${nombre}: "${parte}"`);
        }
        if (desde < min || hasta > max || desde > hasta) throw new ErrorCron(`${nombre} fuera de rango (${min}-${max}): "${parte}"`);

        for (let v = desde; v <= hasta; v += paso) valores.add(v);
    }
    return valores;
}

export function parsearCron(expresion) {
    const partes = String(expresion).trim().split(/\s+/);
    if (partes.length !== 5) throw new ErrorCron(`la expresion necesita 5 campos y tiene ${partes.length}: "${expresion}"`);
    const cron = { expresion: partes.join(" ") };
    CAMPOS.forEach((campo, i) => {
        cron[campo.nombre] = parsearCampo(partes[i], campo);
    });
    return cron;
}

export function coincide(cron, fecha) {
    return (
        cron.minuto.has(fecha.getUTCMinutes()) &&
        cron.hora.has(fecha.getUTCHours()) &&
        cron.dia.has(fecha.getUTCDate()) &&
        cron.mes.has(fecha.getUTCMonth() + 1) &&
        cron.diaSemana.has(fecha.getUTCDay())
    );
}

// proximas n ejecuciones despues de `desde` (busca minuto a minuto, maximo un anio)
export function siguientes(cron, desde = new Date(), n = 1) {
    const resultado = [];
    const fecha = new Date(desde);
    fecha.setUTCSeconds(0, 0);
    const limite = 366 * 24 * 60;
    for (let i = 0; i < limite && resultado.length < n; i++) {
        fecha.setUTCMinutes(fecha.getUTCMinutes() + 1);
        if (coincide(cron, fecha)) resultado.push(new Date(fecha));
    }
    return resultado;
}
