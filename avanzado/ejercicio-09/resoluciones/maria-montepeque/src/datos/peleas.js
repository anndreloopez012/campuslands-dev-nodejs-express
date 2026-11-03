// genera el historial de peleas de a una (no arma un arreglo gigante)
// los datos salen del indice, asi siempre son los mismos (sirve para los tests)

const PELEADORES = ["Rico Verhoeven", "Badr Hari", "Alistair Overeem", "Giorgio Petrosyan", "Buakaw Banchamek", "Superbon", "Tenshin Nasukawa", "Andy Souwer"];
const CATEGORIAS = ["pluma", "ligero", "welter", "medio", "pesado"];
const RESULTADOS = ["KO", "TKO", "decision", "decision dividida"];

export const TOTAL_PELEAS = 5000;

export function pelea(i) {
    return {
        id: i + 1,
        fecha: new Date(Date.UTC(2015, 0, 1) + i * 86_400_000).toISOString().slice(0, 10),
        rojo: PELEADORES[i % PELEADORES.length],
        azul: PELEADORES[(i * 3 + 1) % PELEADORES.length],
        categoria: CATEGORIAS[i % CATEGORIAS.length],
        resultado: RESULTADOS[(i * 7) % RESULTADOS.length],
        round: (i % 5) + 1
    };
}

// async generator: cada "yield" entrega una pelea cuando el stream la pide
// estado.generadas sirve para ver cuantas se llegaron a crear (si el cliente corta, para)
export async function* generarPeleas({ total = TOTAL_PELEAS, estado = {} } = {}) {
    estado.generadas = 0;
    try {
        for (let i = 0; i < total; i++) {
            estado.generadas++;
            yield pelea(i);
            // cada tanto le doy paso al event loop, como haria una base de datos real
            if (i % 200 === 0) await new Promise((r) => setImmediate(r));
        }
    } finally {
        // se ejecuta tambien si el stream se destruye antes de terminar
        estado.cerrado = true;
    }
}
