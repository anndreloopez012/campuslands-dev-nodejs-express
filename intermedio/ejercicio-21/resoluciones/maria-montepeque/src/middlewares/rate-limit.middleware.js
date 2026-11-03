// rate limit hecho a mano con "ventana fija":
// cada cliente tiene un contador que se reinicia cada ventanaMs
// si pasa de max peticiones dentro de la ventana responde 429

// todos los limitadores guardan aqui sus contadores para poder verlos
const limitadores = new Map();

// el cliente se identifica por IP
// no uso un header como x-api-key sin verificarlo, porque mandando
// una clave inventada distinta cada vez se saltaria el limite
function claveDelCliente(req) {
    return `ip:${req.ip}`;
}

function crearRateLimit({ nombre, ventanaMs, max, mensaje }) {
    const contadores = new Map();
    limitadores.set(nombre, { ventanaMs, max, contadores });

    // cada ventana borro los contadores viejos para que el Map no crezca siempre
    // unref para que este timer no deje el proceso prendido
    setInterval(() => {
        const ahora = Date.now();
        for (const [clave, datos] of contadores) {
            if (ahora - datos.inicio >= ventanaMs) contadores.delete(clave);
        }
    }, ventanaMs).unref();

    return function (req, res, next) {
        const clave = claveDelCliente(req);
        const ahora = Date.now();
        let datos = contadores.get(clave);

        // primera vez o ya paso la ventana: empiezo de cero
        if (!datos || ahora - datos.inicio >= ventanaMs) {
            datos = { inicio: ahora, cantidad: 0 };
            contadores.set(clave, datos);
        }

        datos.cantidad++;

        const restantes = Math.max(0, max - datos.cantidad);
        const segundosParaReset = Math.ceil((datos.inicio + ventanaMs - ahora) / 1000);

        // headers para que el cliente sepa cuanto le queda
        res.set("RateLimit-Policy", `${max};w=${ventanaMs / 1000}`);
        res.set("RateLimit-Limit", String(max));
        res.set("RateLimit-Remaining", String(restantes));
        res.set("RateLimit-Reset", String(segundosParaReset));

        if (datos.cantidad > max) {
            // Retry-After dice en cuantos segundos puede volver a intentar
            res.set("Retry-After", String(segundosParaReset));
            return res.status(429).json({
                ok: false,
                message: mensaje || "Demasiadas peticiones, espera un momento",
                limite: nombre,
                reintentarEnSegundos: segundosParaReset
            });
        }

        next();
    };
}

// para la ruta de estado: cuanto lleva este cliente en cada limitador
function estadoDelCliente(req) {
    const clave = claveDelCliente(req);
    const ahora = Date.now();
    const resultado = {};

    for (const [nombre, { ventanaMs, max, contadores }] of limitadores) {
        const datos = contadores.get(clave);
        const vigente = datos && ahora - datos.inicio < ventanaMs;
        const usadas = vigente ? datos.cantidad : 0;

        resultado[nombre] = {
            max,
            ventanaSegundos: ventanaMs / 1000,
            usadas,
            restantes: Math.max(0, max - usadas),
            resetEnSegundos: vigente ? Math.ceil((datos.inicio + ventanaMs - ahora) / 1000) : 0
        };
    }

    return { cliente: clave, limites: resultado };
}

export { crearRateLimit, estadoDelCliente };
