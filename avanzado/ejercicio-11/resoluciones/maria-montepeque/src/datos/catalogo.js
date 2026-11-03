// catalogo de canciones en memoria, la clave es el ISRC (codigo unico de cada grabacion)
// tiene operaciones por LOTE: aplicar 500 de una vez es mucho mas rapido que de a una
// (en una base de datos real seria un solo INSERT con muchas filas)

export function crearCatalogo(iniciales = []) {
    const canciones = new Map(iniciales.map((c) => [c.isrc, { ...c }]));
    let lotesAplicados = 0;

    return {
        existe: (isrc) => canciones.has(isrc),
        buscar: (isrc) => (canciones.has(isrc) ? { ...canciones.get(isrc) } : null),
        total: () => canciones.size,
        lotesAplicados: () => lotesAplicados,

        // aplica un lote: cada operacion es { tipo: "insertar" | "actualizar", cancion }
        aplicarLote(operaciones) {
            lotesAplicados++;
            for (const { cancion } of operaciones) {
                canciones.set(cancion.isrc, { ...cancion });
            }
        },

        listar({ artista, q, limit = 20 } = {}) {
            const texto = q?.toLowerCase();
            return [...canciones.values()]
                .filter((c) => !artista || c.artista.toLowerCase() === artista.toLowerCase())
                .filter((c) => !texto || c.titulo.toLowerCase().includes(texto) || c.artista.toLowerCase().includes(texto))
                .slice(0, limit)
                .map((c) => ({ ...c }));
        }
    };
}

export const CANCIONES_INICIALES = [
    { isrc: "USUM71703861", titulo: "Despacito", artista: "Luis Fonsi", genero: "reggaeton", anio: 2017, duracionSeg: 229 },
    { isrc: "GBAYE0601498", titulo: "Bohemian Rhapsody", artista: "Queen", genero: "rock", anio: 1975, duracionSeg: 355 },
    { isrc: "MXF011900001", titulo: "La Bachata", artista: "Manuel Turizo", genero: "bachata", anio: 2022, duracionSeg: 162 }
];
