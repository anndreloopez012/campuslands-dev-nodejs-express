import "dotenv/config";

function numero(nombre, porDefecto) {
    const valor = Number(process.env[nombre]);
    return Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

const config = {
    port: numero("PORT", 3022),
    maxArchivoMb: numero("MAX_ARCHIVO_MB", 2),
    maxArchivosPorSubida: numero("MAX_ARCHIVOS_POR_SUBIDA", 3)
};

export default config;
