import { EventEmitter } from "node:events";

// eventos que existen en el sistema
// si alguien publica uno que no esta aqui es un error (evita typos como "pedido.creaddo")
export const EVENTOS = [
    "pedido.creado",
    "pedido.confirmado",
    "pedido.rechazado",
    "pedido.en_produccion",
    "pedido.entregado",
    "pedido.cancelado"
];

// bus de eventos sobre el EventEmitter de Node
//
// - quien publica no sabe quien escucha (el servicio de pedidos no conoce al inventario)
// - si un suscriptor falla, los demas siguen y el que publico no se entera
// - "*" recibe todos los eventos (el EventEmitter normal no tiene comodin)
export class Bus extends EventEmitter {
    constructor() {
        super();
        this.siguienteId = 1;
        this.errores = [];
        // evito el aviso de "posible memory leak" con mas de 10 suscriptores
        this.setMaxListeners(50);
    }

    publicar(evento, datos) {
        if (!EVENTOS.includes(evento)) {
            throw new Error(`El evento "${evento}" no existe`);
        }

        const mensaje = { id: this.siguienteId++, evento, datos, fecha: new Date().toISOString() };

        // ojo: emit es SINCRONO, llama a cada suscriptor en orden y recien despues sigue
        //
        // primero "*" y despues los del evento: si un suscriptor publica otro evento
        // adentro (el inventario publica "confirmado" mientras atiende "creado"),
        // con el orden al reves la auditoria veria "confirmado" antes que "creado"
        this.emit("*", mensaje);
        this.emit(evento, mensaje);
        return mensaje;
    }

    // suscribir con nombre (para saber quien fallo) y protegido contra errores
    // devuelve una funcion para desuscribirse
    suscribir(evento, nombre, fn) {
        const protegido = (mensaje) => {
            try {
                const resultado = fn(mensaje);
                // si el suscriptor es async, atrapo el error de la promesa
                if (resultado && typeof resultado.catch === "function") {
                    resultado.catch((error) => this.registrarError(nombre, mensaje, error));
                }
            } catch (error) {
                this.registrarError(nombre, mensaje, error);
            }
        };

        this.on(evento, protegido);
        return () => this.off(evento, protegido);
    }

    registrarError(suscriptor, mensaje, error) {
        this.errores.push({ suscriptor, evento: mensaje.evento, mensajeId: mensaje.id, error: error.message });
    }

    // cuantos escuchan cada evento
    resumen() {
        return Object.fromEntries([...EVENTOS, "*"].map((e) => [e, this.listenerCount(e)]));
    }
}
