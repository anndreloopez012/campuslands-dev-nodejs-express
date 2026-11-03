// simula mandar un SMS al cliente
// los mensajes quedan en "enviados" para poder verlos
export function crearTrabajoNotificar({ duracionMs = 50 } = {}) {
    const enviados = [];

    async function notificar({ telefono, mensaje }) {
        await new Promise((resolve) => setTimeout(resolve, duracionMs));
        const sms = { telefono, mensaje, enviado: new Date().toISOString() };
        enviados.push(sms);
        return sms;
    }

    notificar.enviados = enviados;
    return notificar;
}
