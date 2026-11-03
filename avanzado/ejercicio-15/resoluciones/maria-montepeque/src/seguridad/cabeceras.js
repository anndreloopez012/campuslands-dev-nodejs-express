import { randomBytes } from "node:crypto";

// headers de seguridad hechos a mano (lo que hace la libreria helmet)
// cada uno cierra una puerta que el navegador deja abierta por defecto

// CSP para respuestas JSON: la API no carga nada, no se mete en iframes
const CSP_API = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

export function cabecerasSeguras({ produccion = process.env.NODE_ENV === "production", hstsSegundos = 15_552_000 } = {}) {
    return (req, res, next) => {
        // el navegador NO adivina el tipo de archivo: si digo JSON es JSON (evita que un .json se ejecute como script)
        res.set("X-Content-Type-Options", "nosniff");

        // nadie puede meter esta pagina en un iframe (evita clickjacking)
        // es la version vieja; la nueva es frame-ancestors en la CSP
        res.set("X-Frame-Options", "DENY");

        // al seguir un link no se manda la URL de donde venia (puede tener datos)
        res.set("Referrer-Policy", "no-referrer");

        // la pagina no puede pedir camara, microfono ni ubicacion
        res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

        // aisla la ventana y los recursos de otros sitios
        res.set("Cross-Origin-Opener-Policy", "same-origin");
        res.set("Cross-Origin-Resource-Policy", "same-origin");

        // el navegador no resuelve DNS de los links por adelantado
        res.set("X-DNS-Prefetch-Control", "off");

        // CSP por defecto (la pagina HTML la cambia por una con nonce)
        res.set("Content-Security-Policy", CSP_API);

        // HSTS: "esta pagina solo por HTTPS de ahora en adelante"
        // solo se manda si la conexion YA es HTTPS (mandarlo por HTTP no sirve y en local molesta)
        if (produccion && req.secure) {
            res.set("Strict-Transport-Security", `max-age=${hstsSegundos}; includeSubDomains`);
        }

        next();
    };
}

// para paginas HTML con un script propio: un nonce (numero de un solo uso) por respuesta
// solo los <script nonce="..."> con ese valor se ejecutan; un script inyectado no lo tiene
export function cspConNonce(req, res, next) {
    const nonce = randomBytes(16).toString("base64");
    res.locals.nonce = nonce;
    res.set(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            `script-src 'nonce-${nonce}'`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "object-src 'none'",
            "base-uri 'none'",
            "frame-ancestors 'none'",
            "form-action 'self'"
        ].join("; ")
    );
    next();
}

// cache: los datos personales nunca se guardan (ni en el navegador ni en un proxy)
export const sinCache = (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
};

export const cachePublica = (segundos) => (req, res, next) => {
    res.set("Cache-Control", `public, max-age=${segundos}`);
    next();
};
