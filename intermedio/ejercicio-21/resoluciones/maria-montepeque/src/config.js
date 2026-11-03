import "dotenv/config";

function numero(nombre, porDefecto) {
    const valor = Number(process.env[nombre]);
    return Number.isInteger(valor) && valor > 0 ? valor : porDefecto;
}

const config = {
    port: numero("PORT", 3021),
    limiteGeneral: {
        ventanaMs: numero("RATE_LIMIT_VENTANA_SEGUNDOS", 60) * 1000,
        max: numero("RATE_LIMIT_MAX", 30)
    },
    limiteRender: {
        ventanaMs: numero("RENDER_LIMIT_VENTANA_SEGUNDOS", 60) * 1000,
        max: numero("RENDER_LIMIT_MAX", 3)
    }
};

export default config;
