// el jugador guarda su clubId y el club guarda la lista jugadorIds
// los dos tienen que coincidir siempre: por eso se cambian juntos en una transaccion
// montos en quetzales
export const DATOS_INICIALES = {
    clubes: [
        { id: 1, nombre: "Comunicaciones", modalidad: "futbol", presupuesto: 2_000_000, maxPlantilla: 25, jugadorIds: [1, 2] },
        { id: 2, nombre: "Municipal", modalidad: "futbol", presupuesto: 1_500_000, maxPlantilla: 25, jugadorIds: [3, 4] },
        { id: 3, nombre: "Xelaju", modalidad: "futbol", presupuesto: 400_000, maxPlantilla: 3, jugadorIds: [5, 6, 7] },
        { id: 4, nombre: "Glucosoral", modalidad: "futsal", presupuesto: 300_000, maxPlantilla: 14, jugadorIds: [8] },
        { id: 5, nombre: "Bufalos", modalidad: "futsal", presupuesto: 150_000, maxPlantilla: 14, jugadorIds: [9] }
    ],
    jugadores: [
        { id: 1, nombre: "Rodrigo Saravia", posicion: "medio", clubId: 1 },
        { id: 2, nombre: "Kevin Grajeda", posicion: "delantero", clubId: 1 },
        { id: 3, nombre: "Ruben Morales", posicion: "defensa", clubId: 2 },
        { id: 4, nombre: "Jose Martinez", posicion: "portero", clubId: 2 },
        { id: 5, nombre: "Luis Andrade", posicion: "medio", clubId: 3 },
        { id: 6, nombre: "Erick Lemus", posicion: "delantero", clubId: 3 },
        { id: 7, nombre: "Pablo Lopez", posicion: "defensa", clubId: 3 },
        { id: 8, nombre: "Byron Santizo", posicion: "ala", clubId: 4 },
        { id: 9, nombre: "Diego Paz", posicion: "pivot", clubId: 5 }
    ],
    fichajes: [],
    // cada entrada o salida de dinero queda anotada (como un libro contable)
    movimientos: []
};
