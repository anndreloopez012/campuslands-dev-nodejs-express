// errores del juego
// el dominio NO sabe de HTTP: aqui no hay status 404 ni 409
// solo dice QUE paso (code) y con que datos (detalles)

export class ErrorDeDominio extends Error {
    constructor(code, mensaje, detalles = {}) {
        super(mensaje);
        this.name = this.constructor.name;
        this.code = code;
        this.detalles = detalles;
    }
}

// las 5 familias de errores
// la capa HTTP decide que status le toca a cada familia
export class DatosInvalidos extends ErrorDeDominio {}
export class NoEncontrado extends ErrorDeDominio {}
export class Conflicto extends ErrorDeDominio {}
export class EstadoInvalido extends ErrorDeDominio {}
export class ReglaDelJuego extends ErrorDeDominio {}

// catalogo: cada error que puede pasar, con su codigo fijo
// los clientes (la app del juego) se guian por el code, no por el mensaje,
// asi el mensaje se puede cambiar o traducir sin romper nada
export const CATALOGO = {
    DATOS_INVALIDOS: { familia: DatosInvalidos, titulo: "Datos invalidos", descripcion: "El body o los parametros no tienen el formato correcto." },
    PARTIDA_NO_ENCONTRADA: { familia: NoEncontrado, titulo: "Partida no encontrada", descripcion: "No hay una partida con ese id." },
    JUGADOR_NO_ENCONTRADO: { familia: NoEncontrado, titulo: "Jugador no encontrado", descripcion: "Ese gamertag no esta en la partida." },
    ITEM_NO_ENCONTRADO: { familia: NoEncontrado, titulo: "Item no encontrado", descripcion: "No existe un item con ese id en la partida." },
    ITEM_YA_RECOGIDO: { familia: Conflicto, titulo: "Item ya recogido", descripcion: "Otro jugador (o el mismo) ya recogio ese item." },
    PARTIDA_NO_EN_CURSO: { familia: EstadoInvalido, titulo: "La partida no esta en curso", descripcion: "Solo se puede jugar con la partida en estado en_curso." },
    JUGADOR_ELIMINADO: { familia: EstadoInvalido, titulo: "Jugador eliminado", descripcion: "Un jugador eliminado no puede actuar ni ser atacado." },
    INVENTARIO_LLENO: { familia: ReglaDelJuego, titulo: "Inventario lleno", descripcion: "El inventario tiene 5 espacios. Hay que usar algo antes de recoger mas." },
    ITEM_NO_EN_INVENTARIO: { familia: ReglaDelJuego, titulo: "Item no esta en el inventario", descripcion: "Solo se puede usar lo que el jugador lleva." },
    ITEM_NO_USABLE: { familia: ReglaDelJuego, titulo: "Item no usable", descripcion: "Las armas se usan disparando, no con usar." },
    VIDA_COMPLETA: { familia: ReglaDelJuego, titulo: "Vida completa", descripcion: "No se puede usar un botiquin con la vida en 100." },
    ESCUDO_COMPLETO: { familia: ReglaDelJuego, titulo: "Escudo completo", descripcion: "El escudo ya esta en 50." },
    ARMA_NO_EQUIPADA: { familia: ReglaDelJuego, titulo: "Arma no equipada", descripcion: "Para disparar hay que tener esa arma en el inventario." },
    SIN_MUNICION: { familia: ReglaDelJuego, titulo: "Sin municion", descripcion: "No queda municion para disparar." },
    AUTO_DISPARO: { familia: ReglaDelJuego, titulo: "No te puedes disparar", descripcion: "El objetivo tiene que ser otro jugador." }
};

// fabrica: crea el error correcto a partir del code del catalogo
// uso: throw error("INVENTARIO_LLENO", "Raven tiene 5 de 5", { capacidad: 5 })
export function error(code, mensaje, detalles) {
    const entrada = CATALOGO[code];
    if (!entrada) {
        // si alguien usa un code que no esta en el catalogo es un bug nuestro
        throw new Error(`El code ${code} no esta en el catalogo de errores`);
    }
    return new entrada.familia(code, mensaje, detalles);
}
