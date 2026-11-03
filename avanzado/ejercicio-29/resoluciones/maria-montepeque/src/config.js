// config minima pero validada: en produccion falta algo -> no arranca

export class ErrorConfig extends Error {}

export function leerConfig(env = process.env) {
    const errores = [];
    const entorno = env.NODE_ENV ?? "development";
    if (!["development", "test", "production"].includes(entorno)) errores.push(`NODE_ENV invalido: ${entorno}`);

    const puerto = Number(env.PORT ?? 4029);
    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) errores.push(`PORT invalido: ${env.PORT}`);

    const produccion = entorno === "production";
    // en produccion estas son obligatorias
    for (const nombre of ["DATABASE_URL", "GIT_SHA"]) {
        if (produccion && !env[nombre]) errores.push(`${nombre} es obligatoria en production`);
    }

    const limite = Number(env.LIMITE_POR_MINUTO ?? 120);
    if (!Number.isInteger(limite) || limite < 1) errores.push(`LIMITE_POR_MINUTO invalido: ${env.LIMITE_POR_MINUTO}`);

    if (errores.length > 0) throw new ErrorConfig(`Configuracion invalida: ${errores.join("; ")}`);

    return Object.freeze({
        entorno,
        produccion,
        puerto,
        databaseUrl: env.DATABASE_URL ?? "memoria://local",
        gitSha: env.GIT_SHA ?? "desarrollo",
        limitePorMinuto: limite,
        // detras de un proxy (nginx, la nube) para que req.ip sea la del cliente
        confiarProxy: env.CONFIAR_PROXY === "true",
        tiempoApagadoMs: Number(env.TIEMPO_APAGADO_MS ?? 10_000)
    });
}
