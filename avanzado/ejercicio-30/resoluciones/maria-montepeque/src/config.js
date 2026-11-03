// configuracion validada al arrancar
export function leerConfig(env = process.env) {
    const entorno = env.NODE_ENV ?? "development";
    const errores = [];

    const puerto = Number(env.PORT ?? 4030);
    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) errores.push(`PORT invalido: ${env.PORT}`);

    const jwtSecreto = env.JWT_SECRETO ?? (entorno === "production" ? undefined : "secreto-solo-para-desarrollo-del-taller-1234");
    if (!jwtSecreto || jwtSecreto.length < 32) errores.push("JWT_SECRETO es obligatorio y debe tener al menos 32 caracteres");

    // tarifa de mano de obra por hora, en centavos (Q150.00)
    const tarifaHora = Number(env.TARIFA_HORA ?? 15000);
    if (!Number.isInteger(tarifaHora) || tarifaHora < 0) errores.push("TARIFA_HORA debe ser un entero en centavos");

    if (errores.length > 0) throw new Error(`Configuracion invalida: ${errores.join("; ")}`);
    return Object.freeze({ entorno, puerto, jwtSecreto, jwtExpira: env.JWT_EXPIRA ?? "1h", tarifaHora });
}
