// todo en memoria
const db = {
    sesiones: new Map(), // token => gamertag
    escuadras: [],
    partidas: [],
    siguienteEscuadra: 1,
    siguientePartida: 1
};

function resetDb() {
    db.sesiones.clear();
    db.escuadras.length = 0;
    db.partidas.length = 0;
    db.siguienteEscuadra = 1;
    db.siguientePartida = 1;
}

export { db, resetDb };
