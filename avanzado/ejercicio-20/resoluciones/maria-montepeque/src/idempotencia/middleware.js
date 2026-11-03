import { huella } from "./almacen.js";

const FORMATO_LLAVE = /^[A-Za-z0-9_-]{8,100}$/;

// middleware para POST que cobran o crean cosas
// la primera vez se ejecuta normal y se guarda la respuesta
// si llega otra vez la misma llave, se devuelve la misma respuesta sin volver a cobrar
export function idempotente(almacen) {
    return (req, res, next) => {
        const llave = req.get("Idempotency-Key");
        if (!llave) return res.status(400).json({ ok: false, message: "Falta el header Idempotency-Key (usa un UUID por operacion)" });
        if (!FORMATO_LLAVE.test(llave)) return res.status(400).json({ ok: false, message: "Idempotency-Key debe tener de 8 a 100 caracteres (letras, numeros, - y _)" });

        // la llave es por usuario: dos clientes pueden usar la misma sin pisarse
        const clave = `${req.usuario}:${llave}`;
        const miHuella = huella(req.method, req.originalUrl, req.body);
        const existente = almacen.reservar(clave, miHuella);

        if (existente) {
            if (existente.huella !== miHuella) {
                return res.status(422).json({ ok: false, message: "Esta Idempotency-Key ya se uso con otro pedido distinto" });
            }
            if (existente.estado === "en_proceso") {
                // el primer pedido todavia no termina (doble click muy rapido)
                return res.status(409).set("Retry-After", "1").json({ ok: false, message: "Ya se esta procesando un pedido con esta llave, intenta en un momento" });
            }
            // repeticion: misma respuesta de antes
            const { status, body } = existente.respuesta;
            return res.status(status).set("Idempotency-Replayed", "true").json(body);
        }

        // capturo lo que la ruta responda para guardarlo
        const jsonOriginal = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 500) {
                // error del servidor: no se guarda, el cliente puede reintentar con la misma llave
                almacen.liberar(clave);
            } else {
                almacen.completar(clave, { status: res.statusCode, body });
            }
            res.set("Idempotency-Replayed", "false");
            return jsonOriginal(body);
        };
        next();
    };
}
