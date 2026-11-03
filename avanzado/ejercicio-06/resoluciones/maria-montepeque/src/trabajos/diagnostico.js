// el trabajo pesado: revisar la moto y armar un presupuesto
// en la vida real seria lento (consultar catalogos, otra API, generar un PDF...)

export const SINTOMAS = {
    "ruido-cadena": { trabajo: "Ajuste y lubricacion de cadena", precio: 75 },
    "frenos-esponjosos": { trabajo: "Purgar sistema de frenos", precio: 150 },
    "no-arranca": { trabajo: "Revisar bateria y bujia", precio: 120 },
    "humo-azul": { trabajo: "Revisar anillos y retenes", precio: 900 },
    "luz-aceite": { trabajo: "Cambio de aceite y filtro", precio: 180 },
    "vibracion": { trabajo: "Balanceo de llantas", precio: 95 }
};

// opciones.duracionMs: cuanto "tarda" el diagnostico
export function crearTrabajoDiagnostico({ duracionMs = 300 } = {}) {
    const fallosPorPlaca = new Map();

    return async function diagnostico(datos, { intento, encolar }) {
        const { placa, sintomas, telefono, simular } = datos;

        // fallas para probar la cola (solo se pueden pedir fuera de produccion)
        if (simular === "fallar-siempre") {
            throw new Error("El escaner de la moto no responde");
        }
        if (simular === "fallar-2-veces") {
            const veces = fallosPorPlaca.get(placa) || 0;
            if (veces < 2) {
                fallosPorPlaca.set(placa, veces + 1);
                throw new Error(`El escaner se desconecto (intento ${intento})`);
            }
        }

        await new Promise((resolve) => setTimeout(resolve, simular === "lento" ? duracionMs * 100 : duracionMs));

        const trabajos = sintomas.map((s) => ({ sintoma: s, ...SINTOMAS[s] }));
        const total = trabajos.reduce((suma, t) => suma + t.precio, 0);

        // cuando termina deja otra tarea en la cola: avisarle al cliente
        // prioridad baja porque no es urgente
        const aviso = encolar(
            "notificar-cliente",
            { telefono, mensaje: `Su moto ${placa} ya fue revisada. Presupuesto: Q${total}` },
            { prioridad: "baja" }
        );

        return { placa, trabajos, total, notificacionId: aviso.id };
    };
}
