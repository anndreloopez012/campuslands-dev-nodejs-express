import config from "../config.js";
import AppError from "../utils/app-error.js";

// cors para la API privada: solo los origenes del .env
const corsPrivado = {
    origin(origin, callback) {
        // curl, postman o otro servidor no mandan Origin, esos los dejo pasar
        // CORS es cosa del navegador, no es seguridad contra todo
        if (!origin) {
            return callback(null, true);
        }

        if (config.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new AppError(403, `El origen ${origin} no tiene permiso (CORS)`));
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // para que el front pueda leer este header
    exposedHeaders: ["X-Total-Count"],
    // permite mandar cookies o Authorization desde el navegador
    credentials: true,
    // el navegador guarda el preflight 10 minutos
    maxAge: 600
};

// cors para la galeria publica: cualquier origen, solo lectura
const corsPublico = {
    origin: "*",
    methods: ["GET"]
};

export { corsPrivado, corsPublico };
