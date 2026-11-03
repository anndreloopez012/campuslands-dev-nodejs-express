import { error } from "./errores.js";

export const CAPACIDAD_INVENTARIO = 5;
const VIDA_MAXIMA = 100;
const ESCUDO_MAXIMO = 50;

// la partida tiene sus reglas adentro (modelo de dominio)
// si algo no se puede hacer, tira el error del dominio que corresponde
export class Partida {
    constructor({ id, mapa, estado = "en_curso", jugadores = [], items = [] }) {
        this.id = id;
        this.mapa = mapa;
        this.estado = estado;
        this.ganador = null;
        this.jugadores = new Map(
            jugadores.map((gamertag) => [gamertag.toLowerCase(), { gamertag, vida: VIDA_MAXIMA, escudo: 0, municion: 0, inventario: [], bajas: 0, vivo: true }])
        );
        // items en el suelo: id -> item
        this.items = new Map(items.map((item) => [item.id, { ...item }]));
        // quien recogio cada item: id -> gamertag
        this.recogidos = new Map();
    }

    // ---- consultas ----

    jugador(gamertag) {
        const jugador = this.jugadores.get(String(gamertag).toLowerCase());
        if (!jugador) {
            throw error("JUGADOR_NO_ENCONTRADO", `${gamertag} no esta en la partida ${this.id}`, { gamertag, partidaId: this.id });
        }
        return jugador;
    }

    vivos() {
        return [...this.jugadores.values()].filter((j) => j.vivo);
    }

    // ---- reglas que se repiten ----

    exigirEnCurso() {
        if (this.estado !== "en_curso") {
            throw error("PARTIDA_NO_EN_CURSO", `La partida ${this.id} esta en estado "${this.estado}"`, { estado: this.estado });
        }
    }

    exigirVivo(jugador) {
        if (!jugador.vivo) {
            throw error("JUGADOR_ELIMINADO", `${jugador.gamertag} ya fue eliminado`, { gamertag: jugador.gamertag });
        }
    }

    // un jugador puede actuar si la partida sigue y el esta vivo
    actor(gamertag) {
        this.exigirEnCurso();
        const jugador = this.jugador(gamertag);
        this.exigirVivo(jugador);
        return jugador;
    }

    // ---- acciones ----

    recoger(gamertag, itemId) {
        const jugador = this.actor(gamertag);

        if (this.recogidos.has(itemId)) {
            throw error("ITEM_YA_RECOGIDO", `El item ${itemId} ya lo recogio ${this.recogidos.get(itemId)}`, { itemId, recogidoPor: this.recogidos.get(itemId) });
        }
        const item = this.items.get(itemId);
        if (!item) {
            throw error("ITEM_NO_ENCONTRADO", `No hay item ${itemId} en la partida`, { itemId });
        }

        // la municion no ocupa espacio, se suma al contador
        if (item.tipo === "municion") {
            jugador.municion += item.cantidad;
        } else {
            if (jugador.inventario.length >= CAPACIDAD_INVENTARIO) {
                throw error("INVENTARIO_LLENO", `${jugador.gamertag} ya tiene ${CAPACIDAD_INVENTARIO} de ${CAPACIDAD_INVENTARIO} espacios ocupados`, {
                    capacidad: CAPACIDAD_INVENTARIO,
                    ocupados: jugador.inventario.length
                });
            }
            jugador.inventario.push(item);
        }

        this.items.delete(itemId);
        this.recogidos.set(itemId, jugador.gamertag);
        return jugador;
    }

    usar(gamertag, itemId) {
        const jugador = this.actor(gamertag);
        const posicion = jugador.inventario.findIndex((i) => i.id === itemId);

        if (posicion === -1) {
            throw error("ITEM_NO_EN_INVENTARIO", `${jugador.gamertag} no lleva el item ${itemId}`, { itemId });
        }

        const item = jugador.inventario[posicion];

        if (item.tipo === "botiquin") {
            if (jugador.vida >= VIDA_MAXIMA) {
                throw error("VIDA_COMPLETA", `${jugador.gamertag} ya tiene la vida en ${VIDA_MAXIMA}`, { vida: jugador.vida });
            }
            jugador.vida = Math.min(VIDA_MAXIMA, jugador.vida + item.cura);
        } else if (item.tipo === "escudo") {
            if (jugador.escudo >= ESCUDO_MAXIMO) {
                throw error("ESCUDO_COMPLETO", `${jugador.gamertag} ya tiene el escudo en ${ESCUDO_MAXIMO}`, { escudo: jugador.escudo });
            }
            jugador.escudo = Math.min(ESCUDO_MAXIMO, jugador.escudo + item.puntos);
        } else {
            throw error("ITEM_NO_USABLE", `${item.nombre} no se puede usar`, { itemId, tipo: item.tipo });
        }

        // se gasta
        jugador.inventario.splice(posicion, 1);
        return jugador;
    }

    disparar(gamertag, { objetivo, armaId }) {
        const atacante = this.actor(gamertag);
        const victima = this.jugador(objetivo);

        if (victima === atacante) {
            throw error("AUTO_DISPARO", "No te puedes disparar a ti mismo", { gamertag: atacante.gamertag });
        }
        this.exigirVivo(victima);

        const arma = atacante.inventario.find((i) => i.id === armaId && i.tipo === "arma");
        if (!arma) {
            throw error("ARMA_NO_EQUIPADA", `${atacante.gamertag} no lleva el arma ${armaId}`, { armaId });
        }
        if (atacante.municion < 1) {
            throw error("SIN_MUNICION", `${atacante.gamertag} no tiene municion para ${arma.nombre}`, { municion: 0 });
        }

        atacante.municion -= 1;

        // el dano primero baja el escudo y lo que sobra baja la vida
        const alEscudo = Math.min(victima.escudo, arma.dano);
        victima.escudo -= alEscudo;
        victima.vida = Math.max(0, victima.vida - (arma.dano - alEscudo));

        if (victima.vida === 0) {
            victima.vivo = false;
            atacante.bajas += 1;

            // si queda uno solo, gano
            const vivos = this.vivos();
            if (vivos.length === 1) {
                this.estado = "terminada";
                this.ganador = vivos[0].gamertag;
            }
        }

        return { atacante, victima, dano: arma.dano };
    }

    // lo que se muestra afuera
    resumen() {
        return {
            id: this.id,
            mapa: this.mapa,
            estado: this.estado,
            ganador: this.ganador,
            vivos: this.vivos().length,
            jugadores: [...this.jugadores.values()],
            itemsEnElSuelo: [...this.items.values()]
        };
    }
}
