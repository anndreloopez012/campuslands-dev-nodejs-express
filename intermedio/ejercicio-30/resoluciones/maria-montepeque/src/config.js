import "dotenv/config";

// toda la configuracion sale de aqui, ningun otro archivo lee process.env
function numero(nombre, porDefecto) {
    const texto = process.env[nombre];
    if (texto === undefined || texto === "") return porDefecto;

    const valor = Number(texto);
    if (!Number.isInteger(valor) || valor <= 0) {
        throw new Error(`${nombre} debe ser un entero positivo, llego "${texto}"`);
    }
    return valor;
}

const nodeEnv = process.env.NODE_ENV || "development";

const config = Object.freeze({
    nodeEnv,
    port: numero("PORT", 3030),
    jwtSecret: process.env.JWT_SECRET || "secreto-solo-para-desarrollo",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    loginMaxIntentos: numero("LOGIN_MAX_INTENTOS", 5),
    loginBloqueoMs: numero("LOGIN_BLOQUEO_MINUTOS", 15) * 60 * 1000
});

// en produccion no dejo arrancar con el secreto de ejemplo
if (nodeEnv === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error("En production JWT_SECRET es obligatorio y debe tener 32 caracteres o mas");
}

export default config;
