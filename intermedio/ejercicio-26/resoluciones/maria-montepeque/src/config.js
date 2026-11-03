import "dotenv/config";

function numero(nombre, porDefecto) {
    const valor = Number(process.env[nombre]);
    return Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

const config = {
    port: numero("PORT", 3026),
    proveedorUrl: process.env.PROVEEDOR_URL || "http://localhost:4026",
    proveedorTimeoutMs: numero("PROVEEDOR_TIMEOUT_MS", 2000),
    cacheMs: numero("CACHE_SEGUNDOS", 60) * 1000,
    notificarUrl: process.env.NOTIFICAR_URL || ""
};

export default config;
