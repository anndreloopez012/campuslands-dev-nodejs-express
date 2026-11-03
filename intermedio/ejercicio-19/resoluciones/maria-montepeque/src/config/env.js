import "dotenv/config";

// process.env siempre trae texto, aqui lo convierto al tipo correcto
// y junto todos los errores para mostrarlos de una vez
const errores = [];

function leerTexto(nombre, porDefecto) {
    const valor = process.env[nombre];
    if (valor === undefined || valor.trim() === "") return porDefecto;
    return valor.trim();
}

function leerNumero(nombre, porDefecto, min, max) {
    const texto = process.env[nombre];
    if (texto === undefined || texto.trim() === "") return porDefecto;

    const numero = Number(texto);
    if (!Number.isFinite(numero) || numero < min || numero > max) {
        errores.push(`${nombre} debe ser un numero entre ${min} y ${max}, llego "${texto}"`);
        return porDefecto;
    }
    return numero;
}

function leerBooleano(nombre, porDefecto) {
    const texto = process.env[nombre];
    if (texto === undefined || texto.trim() === "") return porDefecto;

    const limpio = texto.trim().toLowerCase();
    if (limpio === "true" || limpio === "1") return true;
    if (limpio === "false" || limpio === "0") return false;

    errores.push(`${nombre} debe ser true o false, llego "${texto}"`);
    return porDefecto;
}

function leerOpcion(nombre, porDefecto, opciones) {
    const valor = leerTexto(nombre, porDefecto);
    if (!opciones.includes(valor)) {
        errores.push(`${nombre} debe ser uno de: ${opciones.join(", ")}, llego "${valor}"`);
        return porDefecto;
    }
    return valor;
}

const nodeEnv = leerOpcion("NODE_ENV", "development", ["development", "production", "test"]);
const esProduccion = nodeEnv === "production";

const config = {
    nodeEnv,
    esProduccion,
    port: leerNumero("PORT", 3019, 1, 65535),
    estudio: {
        nombre: leerTexto("ESTUDIO_NOMBRE", "Estudio de Tatuajes"),
        moneda: leerOpcion("MONEDA", "GTQ", ["GTQ", "USD", "MXN"]),
        ivaPorcentaje: leerNumero("IVA_PORCENTAJE", 12, 0, 50)
    },
    citas: {
        permitidas: leerBooleano("PERMITIR_CITAS", true),
        maxPorDia: leerNumero("MAX_CITAS_POR_DIA", 3, 1, 20)
    },
    // en desarrollo hay una clave por defecto, en produccion no
    adminApiKey: leerTexto("ADMIN_API_KEY", esProduccion ? undefined : "clave-de-desarrollo")
};

if (esProduccion && (!config.adminApiKey || config.adminApiKey.length < 16)) {
    errores.push("ADMIN_API_KEY es obligatoria en production y debe tener 16 caracteres o mas");
}

// si algo esta mal prefiero que no arranque a que falle a medio camino
if (errores.length > 0) {
    console.error("Error en la configuracion (.env):");
    errores.forEach((error) => console.error(` - ${error}`));
    process.exit(1);
}

if (!process.env.ADMIN_API_KEY) {
    console.warn("Aviso: no hay ADMIN_API_KEY en .env, se usa la clave de desarrollo");
}

// freeze para que nadie cambie la config sin querer en otro archivo
Object.freeze(config.estudio);
Object.freeze(config.citas);
Object.freeze(config);

export default config;
