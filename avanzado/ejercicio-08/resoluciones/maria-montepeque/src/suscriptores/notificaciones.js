// manda un correo (simulado) al cliente cuando pasan cosas importantes
// es async a proposito: el pedido no espera a que el correo salga

const PLANTILLAS = {
    "pedido.confirmado": (d) => `Tu ${d.modelo} esta confirmado. Pronto empieza la fabricacion.`,
    "pedido.rechazado": (d) => `Lo sentimos: ${d.motivo}.`,
    "pedido.entregado": (d) => `Tu ${d.modelo} fue entregado. Disfrutalo.`
};

export function registrarNotificaciones(bus, { demoraMs = 20, servidorCorreoCaido = false } = {}) {
    const enviados = [];

    for (const evento of Object.keys(PLANTILLAS)) {
        bus.suscribir(evento, "notificaciones", async ({ datos }) => {
            await new Promise((r) => setTimeout(r, demoraMs));
            if (servidorCorreoCaido) throw new Error("El servidor de correo no responde");
            enviados.push({ para: datos.email, evento, texto: PLANTILLAS[evento](datos) });
        });
    }

    return { enviados: () => [...enviados] };
}
